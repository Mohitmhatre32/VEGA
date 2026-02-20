'use client';

import { useRef, useMemo, useEffect, Suspense, lazy } from 'react';
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

function Satellite({ scrollProgress }: { scrollProgress: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (!groupRef.current || !bodyRef.current) return;
        const t = Math.min(Math.max(scrollProgress, 0), 1);

        if (t < 0.35) {
            const elapsed = clock.getElapsedTime() * 0.4;
            const orbitRadius = 3.2;
            let earthY = 0, earthZ = 0, earthScale = 1;
            if (t >= 0.15) {
                const p = (t - 0.15) / 0.2;
                const ease = p * p * (3 - 2 * p);
                earthScale = THREE.MathUtils.lerp(1, 0.35, ease);
                earthY = THREE.MathUtils.lerp(0, 1.8, ease);
                earthZ = THREE.MathUtils.lerp(0, -3, ease);
            }
            groupRef.current.position.set(
                Math.cos(elapsed) * orbitRadius * earthScale,
                Math.sin(elapsed * 0.7) * 0.8 * earthScale + earthY,
                Math.sin(elapsed) * orbitRadius * earthScale + earthZ,
            );
            bodyRef.current.rotation.y = -elapsed + Math.PI / 2;
            bodyRef.current.rotation.x = 0;
            groupRef.current.scale.setScalar(earthScale > 0.5 ? 1 : earthScale * 2);
        } else if (t < 0.5) {
            const p = (t - 0.35) / 0.15;
            const ease = p * p * (3 - 2 * p);
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 3.5, ease * 0.15);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, ease * 0.15);
            groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 1, ease * 0.15);
            groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.7, 1.2, ease));
        } else {
            const elapsed = clock.getElapsedTime();
            groupRef.current.position.set(3.5, Math.sin(elapsed * 0.5) * 0.15 - ((t - 0.5) / 0.5) * 2, 1);
            groupRef.current.scale.setScalar(1.2);
            bodyRef.current.rotation.y = Math.sin(elapsed * 0.3) * 0.3;
            bodyRef.current.rotation.x = Math.sin(elapsed * 0.2) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <group ref={bodyRef}>
                <mesh><boxGeometry args={[0.18, 0.1, 0.18]} /><meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} /></mesh>
                <mesh position={[0, 0.051, 0]}><boxGeometry args={[0.17, 0.005, 0.17]} /><meshStandardMaterial color="#c8a832" metalness={0.7} roughness={0.3} /></mesh>
                {/* Solar arms */}
                <mesh position={[0.12, 0, 0]}><boxGeometry args={[0.04, 0.01, 0.02]} /><meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} /></mesh>
                <mesh position={[-0.12, 0, 0]}><boxGeometry args={[0.04, 0.01, 0.02]} /><meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} /></mesh>
                {/* Solar panels */}
                {[-0.3, 0.3].map((x) => (
                    <group key={x}>
                        <mesh position={[x, 0, 0]}><boxGeometry args={[0.28, 0.008, 0.14]} /><meshStandardMaterial color="#1a2a4a" metalness={0.4} roughness={0.5} emissive="#0a1520" emissiveIntensity={0.2} /></mesh>
                        <mesh position={[x, 0.005, 0]}><boxGeometry args={[0.28, 0.001, 0.002]} /><meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} /></mesh>
                    </group>
                ))}
                {/* Antenna */}
                <mesh position={[0, -0.07, 0.05]} rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.04, 0.02, 0.02, 16]} /><meshStandardMaterial color="#ddd" metalness={0.9} roughness={0.1} /></mesh>
                <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.003, 0.003, 0.1]} /><meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} /></mesh>
                <mesh position={[0, 0.135, 0]}><sphereGeometry args={[0.006, 8, 8]} /><meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2} /></mesh>
                <mesh position={[0.09, 0.02, 0.09]}><sphereGeometry args={[0.008, 8, 8]} /><meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={1.5} /></mesh>
            </group>
        </group>
    );
}

function Scene({ scrollProgress }: { scrollProgress: number }) {
    const { camera } = useThree();
    useEffect(() => { camera.position.set(0, 0, 6); }, [camera]);

    return (
        <>
            <ambientLight intensity={0.08} />
            <directionalLight position={[5, 2, 3]} intensity={1.4} color="#fffaf0" />
            <pointLight position={[-5, -3, -5]} intensity={0.2} color="#4466ff" />
            <Stars radius={100} depth={60} count={2500} factor={3} saturation={0} fade speed={0.3} />
            <Earth scrollProgress={scrollProgress} />
            <Satellite scrollProgress={scrollProgress} />
        </>
    );
}

export default function EarthScene({ scrollProgress = 0, className }: { scrollProgress?: number; className?: string }) {
    return (
        <div className={className}>
            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                style={{ background: 'transparent' }}
                dpr={[1, 1.5]}
            >
                <Suspense fallback={null}>
                    <Scene scrollProgress={scrollProgress} />
                </Suspense>
            </Canvas>
        </div>
    );
}
