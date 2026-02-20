'use client';

import { useEffect, useRef } from 'react';

interface Star {
    x: number; y: number; r: number;
    dx: number; dy: number;
    opacity: number; speed: number;
}

export function StarField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const count = 120;
        const stars: Star[] = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.2 + 0.3,
            dx: (Math.random() - 0.5) * 0.15,
            dy: -Math.random() * 0.2 - 0.05,
            opacity: Math.random() * 0.5 + 0.2,
            speed: Math.random() * 0.5 + 0.1,
        }));

        let animId: number;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach((s) => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(230, 241, 255, ${s.opacity})`;
                ctx.fill();

                s.x += s.dx;
                s.y += s.dy;

                if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
                if (s.x < -2) s.x = canvas.width + 2;
                if (s.x > canvas.width + 2) s.x = -2;

                // Twinkle
                s.opacity += (Math.random() - 0.5) * 0.02;
                s.opacity = Math.max(0.1, Math.min(0.8, s.opacity));
            });

            animId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ opacity: 0.6 }}
        />
    );
}
