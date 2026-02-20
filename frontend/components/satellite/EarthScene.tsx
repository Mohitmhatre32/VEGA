'use client';

import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface EarthProps { scrollProgress: number }

function Earth({ scrollProgress }: EarthProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);
    const atmoRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const [dayMap, normalMap, specularMap, lightsMap, cloudsMap] = useTexture([
        '/textures/earth_day.jpg',
        '/textures/earth_normal.jpg',
        '/textures/earth_specular.jpg',
        '/textures/earth_lights.png',
        '/textures/earth_clouds.png',
    ]);

    const nightMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            dayTexture: { value: dayMap },
            nightTexture: { value: lightsMap },
            normalMap: { value: normalMap },
            specularMap: { value: specularMap },
            sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
        },
        vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform sampler2D specularMap;
      uniform vec3 sunDirection;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        float sunDot = dot(normal, sunDirection);
        float dayFactor = smoothstep(-0.15, 0.25, sunDot);
        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);
        float specular = texture2D(specularMap, vUv).r;
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 halfDir = normalize(sunDirection + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 64.0) * specular * 0.6;
        float diffuse = max(sunDot, 0.0);
        vec3 dayLit = dayColor.rgb * (diffuse * 0.85 + 0.15) + vec3(spec);
        vec3 nightLit = nightColor.rgb * vec3(1.0, 0.85, 0.5) * 1.8;
        vec3 finalColor = mix(nightLit, dayLit, dayFactor);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    }), [dayMap, lightsMap, normalMap, specularMap]);

    const atmoMat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: { sunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() } },
        vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform vec3 sunDirection;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        float rim = 1.0 - max(dot(normalize(vNormal), normalize(-vPosition)), 0.0);
        float sunDot = max(dot(normalize(vNormal), sunDirection), 0.0);
        vec3 atmosColor = mix(vec3(0.3, 0.6, 1.0), vec3(0.4, 0.7, 1.0), sunDot * 0.5);
        float intensity = pow(rim, 4.0) * 0.8 * (0.5 + sunDot * 0.5);
        gl_FragColor = vec4(atmosColor, intensity * 0.45);
      }
    `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
    }), []);

    useFrame((_, delta) => {
        if (meshRef.current) meshRef.current.rotation.y += delta * 0.06;
        if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.08;
    });

    useFrame(() => {
        if (!groupRef.current) return;
        const t = Math.min(Math.max(scrollProgress, 0), 1);
        let scale = 1, yPos = 0, zPos = 0;
        if (t >= 0.15 && t < 0.35) {
            const p = (t - 0.15) / 0.2;
            const ease = p * p * (3 - 2 * p);
            scale = THREE.MathUtils.lerp(1, 0.35, ease);
            yPos = THREE.MathUtils.lerp(0, 1.8, ease);
            zPos = THREE.MathUtils.lerp(0, -3, ease);
        } else if (t >= 0.35) {
            scale = 0.35; yPos = 1.8; zPos = -3;
        }
        groupRef.current.scale.setScalar(scale);
        groupRef.current.position.set(0, yPos, zPos);
    });

    return (
        <group ref={groupRef}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <primitive object={nightMat} attach="material" />
            </mesh>
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[2.02, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap} transparent opacity={0.35}
                    depthWrite={false} blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh ref={atmoRef}>
                <sphereGeometry args={[2.08, 64, 64]} />
                <primitive object={atmoMat} attach="material" />
            </mesh>
            <Sphere args={[2.25, 32, 32]}>
                <meshBasicMaterial color="#4488ff" transparent opacity={0.03} side={THREE.BackSide} depthWrite={false} />
            </Sphere>
        </group>
    );
}

/* ─── Interactive Cursor-Following Satellite ──────────────────────────── */
function Satellite({ scrollProgress, mouseRef }: {
    scrollProgress: number;
    mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);
    const targetPos = useRef(new THREE.Vector3(3, 1, 1));
    const smoothPos = useRef(new THREE.Vector3(3, 1, 1));
    const smoothRot = useRef({ y: 0, x: 0 });

    useFrame(({ clock, viewport }) => {
        if (!groupRef.current || !bodyRef.current) return;
        const t = Math.min(Math.max(scrollProgress, 0), 1);
        const elapsed = clock.getElapsedTime();

        if (t < 0.35) {
            /* ── Orbiting phase: orbit + subtle cursor pull ─────────── */
            const orbitRadius = 3.2;
            const orbitAngle = elapsed * 0.4;

            let earthY = 0, earthZ = 0, earthScale = 1;
            if (t >= 0.15) {
                const p = (t - 0.15) / 0.2;
                const e = p * p * (3 - 2 * p);
                earthScale = THREE.MathUtils.lerp(1, 0.35, e);
                earthY = THREE.MathUtils.lerp(0, 1.8, e);
                earthZ = THREE.MathUtils.lerp(0, -3, e);
            }

            // Base orbit position
            const baseX = Math.cos(orbitAngle) * orbitRadius * earthScale;
            const baseY = Math.sin(orbitAngle * 0.7) * 0.8 * earthScale + earthY;
            const baseZ = Math.sin(orbitAngle) * orbitRadius * earthScale + earthZ;

            // Cursor attraction (subtle pull toward cursor)
            const pull = 0.4 * earthScale;
            const halfW = viewport.width / 2;
            const halfH = viewport.height / 2;
            const cx = mouseRef.current.x * halfW * pull;
            const cy = mouseRef.current.y * halfH * pull;

            targetPos.current.set(baseX + cx * 0.15, baseY + cy * 0.15, baseZ);

            // Smooth lerp toward target
            smoothPos.current.lerp(targetPos.current, 0.06);
            groupRef.current.position.copy(smoothPos.current);

            // Face direction of travel
            bodyRef.current.rotation.y = -orbitAngle + Math.PI / 2;
            bodyRef.current.rotation.x = 0;

            groupRef.current.scale.setScalar(earthScale > 0.5 ? 1 : earthScale * 2);

        } else {
            /* ── Cursor-follower mode: satellite fully tracks cursor ─── */
            const halfW = viewport.width / 2;
            const halfH = viewport.height / 2;

            // Map normalized mouse [-1,1] to world coords
            const worldX = mouseRef.current.x * halfW * 0.8;
            const worldY = mouseRef.current.y * halfH * 0.8;

            // Subtle float offset
            const floatX = Math.sin(elapsed * 0.7) * 0.08;
            const floatY = Math.sin(elapsed * 0.5) * 0.08;

            targetPos.current.set(worldX + floatX, worldY + floatY, 2);
            smoothPos.current.lerp(targetPos.current, 0.08);

            groupRef.current.position.copy(smoothPos.current);
            groupRef.current.scale.setScalar(1.3);

            // Body tilts toward direction of movement
            const dx = targetPos.current.x - smoothPos.current.x;
            const dy = targetPos.current.y - smoothPos.current.y;
            smoothRot.current.y += (dx * 1.2 - smoothRot.current.y) * 0.1;
            smoothRot.current.x += (-dy * 0.6 - smoothRot.current.x) * 0.1;
            bodyRef.current.rotation.y = smoothRot.current.y;
            bodyRef.current.rotation.x = smoothRot.current.x;
        }
    });

    /* ── Silver/White satellite geometry ───────────────────────────────── */
    const silverBody = { color: '#E8EDF2', metalness: 0.95, roughness: 0.08 };  // bright silver
    const goldStrip = { color: '#D4AF37', metalness: 0.85, roughness: 0.2 };   // warm gold MLI
    const panelBlue = { color: '#1C3150', metalness: 0.5, roughness: 0.4, emissive: '#0a1830' as unknown as THREE.ColorRepresentation, emissiveIntensity: 0.3 };
    const panelGrid = { color: '#4477AA', metalness: 0.9, roughness: 0.1 };
    const armGrey = { color: '#B0B8C4', metalness: 0.85, roughness: 0.2 };

    return (
        <group ref={groupRef}>
            {/* Hover glow ring — always-on point light */}
            <pointLight color="#E8EDF2" intensity={0.6} distance={1.2} decay={2} />

            <group ref={bodyRef}>
                {/* ── Main bus (bright silver box) */}
                <mesh>
                    <boxGeometry args={[0.18, 0.1, 0.18]} />
                    <meshStandardMaterial {...silverBody} />
                </mesh>

                {/* ── Gold MLI top strip */}
                <mesh position={[0, 0.051, 0]}>
                    <boxGeometry args={[0.17, 0.005, 0.17]} />
                    <meshStandardMaterial {...goldStrip} />
                </mesh>

                {/* ── Gold MLI side strips */}
                <mesh position={[0, 0, 0.091]}>
                    <boxGeometry args={[0.18, 0.10, 0.002]} />
                    <meshStandardMaterial color="#C8A832" metalness={0.8} roughness={0.25} />
                </mesh>
                <mesh position={[0, 0, -0.091]}>
                    <boxGeometry args={[0.18, 0.10, 0.002]} />
                    <meshStandardMaterial color="#C8A832" metalness={0.8} roughness={0.25} />
                </mesh>

                {/* ── Solar panel arms */}
                <mesh position={[0.12, 0, 0]}><boxGeometry args={[0.04, 0.01, 0.02]} /><meshStandardMaterial {...armGrey} /></mesh>
                <mesh position={[-0.12, 0, 0]}><boxGeometry args={[0.04, 0.01, 0.02]} /><meshStandardMaterial {...armGrey} /></mesh>

                {/* ── Solar panels (right + left) — deep blue cells with bright grid */}
                {([-0.3, 0.3] as number[]).map((x) => (
                    <group key={x}>
                        <mesh position={[x, 0, 0]}>
                            <boxGeometry args={[0.28, 0.007, 0.14]} />
                            <meshStandardMaterial {...panelBlue} />
                        </mesh>
                        {/* grid lines */}
                        <mesh position={[x, 0.005, 0]}>
                            <boxGeometry args={[0.28, 0.001, 0.002]} />
                            <meshStandardMaterial {...panelGrid} />
                        </mesh>
                        <mesh position={[x, 0.005, 0]} rotation={[0, Math.PI / 2, 0]}>
                            <boxGeometry args={[0.14, 0.001, 0.002]} />
                            <meshStandardMaterial {...panelGrid} />
                        </mesh>
                        {/* Panel edge chrome */}
                        <mesh position={[x, 0, 0.071]}>
                            <boxGeometry args={[0.28, 0.009, 0.002]} />
                            <meshStandardMaterial color="#C0C8D4" metalness={0.95} roughness={0.05} />
                        </mesh>
                    </group>
                ))}

                {/* ── Antenna dish */}
                <mesh position={[0, -0.07, 0.05]} rotation={[0.3, 0, 0]}>
                    <cylinderGeometry args={[0.04, 0.02, 0.02, 16]} />
                    <meshStandardMaterial color="#D8DDE4" metalness={0.92} roughness={0.08} />
                </mesh>

                {/* ── Antenna mast */}
                <mesh position={[0, 0.08, 0]}>
                    <cylinderGeometry args={[0.003, 0.003, 0.1]} />
                    <meshStandardMaterial color="#9AAABB" metalness={0.9} roughness={0.15} />
                </mesh>

                {/* ── Antenna tip — glowing cyan */}
                <mesh position={[0, 0.135, 0]}>
                    <sphereGeometry args={[0.007, 8, 8]} />
                    <meshStandardMaterial
                        color="#00f5ff" emissive="#00f5ff" emissiveIntensity={3}
                        metalness={0} roughness={0}
                    />
                </mesh>
                {/* tip glow point */}
                <pointLight position={[0, 0.135, 0]} color="#00f5ff" intensity={0.4} distance={0.5} decay={2} />

                {/* ── Status LED — green */}
                <mesh position={[0.09, 0.056, 0.09]}>
                    <sphereGeometry args={[0.008, 8, 8]} />
                    <meshStandardMaterial
                        color="#00ff88" emissive="#00ff88" emissiveIntensity={2.5}
                        metalness={0} roughness={0}
                    />
                </mesh>
                <pointLight position={[0.09, 0.056, 0.09]} color="#00ff44" intensity={0.25} distance={0.4} decay={2} />

                {/* ── Secondary LED — amber */}
                <mesh position={[-0.09, 0.056, 0.09]}>
                    <sphereGeometry args={[0.006, 8, 8]} />
                    <meshStandardMaterial
                        color="#FFB800" emissive="#FFB800" emissiveIntensity={2}
                        metalness={0} roughness={0}
                    />
                </mesh>
            </group>
        </group>
    );
}

/* ─── Scene ────────────────────────────────────────────────────────────── */
function Scene({ scrollProgress, mouseRef }: {
    scrollProgress: number;
    mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
    const { camera } = useThree();
    useEffect(() => { camera.position.set(0, 0, 6); }, [camera]);

    return (
        <>
            <ambientLight intensity={0.12} />
            <directionalLight position={[5, 2, 3]} intensity={1.6} color="#fffdf8" />
            {/* Subtle fill from opposite side to show silver */}
            <pointLight position={[-4, -2, -4]} intensity={0.35} color="#8ab4ff" />
            <pointLight position={[0, 5, 2]} intensity={0.15} color="#ffffff" />
            <Stars radius={100} depth={60} count={2500} factor={3} saturation={0} fade speed={0.3} />
            <Earth scrollProgress={scrollProgress} />
            <Satellite scrollProgress={scrollProgress} mouseRef={mouseRef} />
        </>
    );
}

/* ─── Export ───────────────────────────────────────────────────────────── */
export default function EarthScene({
    scrollProgress = 0,
    className,
}: {
    scrollProgress?: number;
    className?: string;
}) {
    const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -((e.clientY / window.innerHeight) * 2 - 1),
            };
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    return (
        <div className={className} style={{ cursor: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                style={{ background: 'transparent' }}
                dpr={[1, 1.5]}
            >
                <Suspense fallback={null}>
                    <Scene scrollProgress={scrollProgress} mouseRef={mouseRef} />
                </Suspense>
            </Canvas>
        </div>
    );
}
