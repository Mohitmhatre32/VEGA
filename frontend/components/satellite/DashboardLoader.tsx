'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Glitch text lines ─────────────────────────────────────────────────── */
const LINES = [
    { text: 'Initializing Orbital AI...', delay: 0.2, color: '#00F5FF' },
    { text: 'Connecting to Satellite Node...', delay: 1.4, color: '#00FF88' },
    { text: 'Terrain Recognition Engine Activated.', delay: 2.6, color: '#FFB800' },
];

/* Random hex char for glitch effect */
const CHARS = '0123456789ABCDEF><=/\\|#@$%!?';
function randChar() { return CHARS[Math.floor(Math.random() * CHARS.length)]; }

/* ─── Typing + glitch text ──────────────────────────────────────────────── */
function GlitchLine({ text, color, startDelay }: { text: string; color: string; startDelay: number }) {
    const [display, setDisplay] = useState('');
    const [done, setDone] = useState(false);
    const indexRef = useRef(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                const i = indexRef.current;
                if (i >= text.length) {
                    setDisplay(text);
                    setDone(true);
                    clearInterval(interval);
                    return;
                }
                // Glitch: show a few random chars then correct char
                const glitch = Array.from({ length: text.length }, (_, j) =>
                    j < i ? text[j] : j === i ? randChar() : randChar()
                ).join('');
                setDisplay(glitch);
                indexRef.current++;
            }, 38);
            return () => clearInterval(interval);
        }, startDelay * 500);
        return () => clearTimeout(timer);
    }, [text, startDelay]);

    return (
        <div className="flex items-center gap-3 min-h-[1.6rem]">
            {/* Prompt character */}
            <span className="text-accent-cyan/50 terminal-text text-xs select-none">{'>'}</span>
            <span
                className={`terminal-text text-sm tracking-widest transition-colors duration-300 ${done ? '' : 'opacity-80'}`}
                style={{ color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}
            >
                {display}
            </span>
            {/* Blinking cursor */}
            {!done && display.length > 0 && (
                <span className="inline-block w-2 h-4 align-middle animate-pulse" style={{ background: color, opacity: 0.8 }} />
            )}
        </div>
    );
}

/* ─── SVG Satellite ─────────────────────────────────────────────────────── */
function SatelliteSVG() {
    return (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            {/* Body */}
            <rect x="24" y="20" width="16" height="12" rx="2" fill="#C0C8D4" stroke="#7AAABB" strokeWidth="0.5" />
            {/* Gold top strip */}
            <rect x="24" y="19" width="16" height="2.5" rx="1" fill="#D4AF37" opacity="0.9" />
            {/* Solar panel arms */}
            <rect x="14" y="24.5" width="10" height="2" rx="1" fill="#8899AA" />
            <rect x="40" y="24.5" width="10" height="2" rx="1" fill="#8899AA" />
            {/* Solar panels */}
            <rect x="4" y="21" width="10" height="9" rx="1" fill="#1C3A5A" stroke="#4477AA" strokeWidth="0.5" />
            <line x1="9" y1="21" x2="9" y2="30" stroke="#336699" strokeWidth="0.5" />
            <rect x="50" y="21" width="10" height="9" rx="1" fill="#1C3A5A" stroke="#4477AA" strokeWidth="0.5" />
            <line x1="55" y1="21" x2="55" y2="30" stroke="#336699" strokeWidth="0.5" />
            {/* Antenna mast */}
            <line x1="32" y1="20" x2="32" y2="12" stroke="#9AAABB" strokeWidth="1" />
            {/* Antenna tip — glowing cyan */}
            <circle cx="32" cy="11" r="2.5" fill="#00F5FF" opacity="0.95">
                <animate attributeName="opacity" values="0.95;0.4;0.95" dur="1.2s" repeatCount="indefinite" />
            </circle>
            {/* Status LED green */}
            <circle cx="38" cy="23" r="1.5" fill="#00FF88">
                <animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite" />
            </circle>
            {/* Dish */}
            <path d="M28 33 Q32 38 36 33" stroke="#AABBCC" strokeWidth="1" fill="none" />
            <line x1="32" y1="34" x2="32" y2="36" stroke="#AABBCC" strokeWidth="0.8" />
        </svg>
    );
}

/* ─── Scan ring that pulses outward ─────────────────────────────────────── */
function ScanRing({ delay }: { delay: number }) {
    return (
        <motion.div
            className="absolute rounded-full border border-accent-cyan/20 pointer-events-none"
            style={{ inset: 0 }}
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay, ease: 'easeOut' }}
        />
    );
}

/* ─── Main loader ───────────────────────────────────────────────────────── */
interface DashboardLoaderProps { onComplete: () => void }

export function DashboardLoader({ onComplete }: DashboardLoaderProps) {
    const [phase, setPhase] = useState<'launch' | 'scan' | 'done'>('launch');
    const [progress, setProgress] = useState(0);

    /* Phase transitions */
    useEffect(() => {
        const t1 = setTimeout(() => setPhase('scan'), 800);
        const t2 = setTimeout(() => setPhase('done'), 3800);
        const t3 = setTimeout(() => onComplete(), 4200);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    /* Progress bar */
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((p) => {
                if (p >= 100) { clearInterval(interval); return 100; }
                const step = p < 80 ? 1.8 : 0.6;
                return Math.min(p + step, 100);
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: '#070B14' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
            {/* CSS starfield overlay */}
            <div className="starfield" />

            {/* Subtle grid lines */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0,245,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,1) 1px, transparent 1px)
          `,
                    backgroundSize: '64px 64px',
                }}
            />

            {/* ── Top system label ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute top-8 left-0 right-0 flex items-center justify-center gap-3"
            >
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent-cyan/30" />
                <span className="terminal-text text-[10px] tracking-[0.4em] text-accent-cyan/30 uppercase">
                    ORBITAL TERRAIN INTELLIGENCE
                </span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent-cyan/30" />
            </motion.div>

            {/* ── Satellite + scan rings ── */}
            <div className="relative mb-12 flex items-center justify-center">
                {/* Scan rings — only in scan phase */}
                {phase === 'scan' && (
                    <>
                        <ScanRing delay={0} />
                        <ScanRing delay={0.7} />
                        <ScanRing delay={1.4} />
                    </>
                )}

                {/* Satellite container */}
                <motion.div
                    className="relative z-10"
                    initial={{ y: 80, opacity: 0, scale: 0.7 }}
                    animate={
                        phase === 'launch'
                            ? { y: 0, opacity: 1, scale: 1 }
                            : phase === 'scan'
                                ? { y: [0, -6, 0], scale: 1.05 }
                                : { y: -60, opacity: 0, scale: 0.5 }
                    }
                    transition={
                        phase === 'launch'
                            ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                            : phase === 'scan'
                                ? { y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.4 } }
                                : { duration: 0.5, ease: 'easeIn' }
                    }
                >
                    <SatelliteSVG />

                    {/* Thruster exhaust during launch */}
                    {phase === 'launch' && (
                        <motion.div
                            className="absolute left-1/2 -translate-x-1/2 -bottom-2"
                            initial={{ scaleY: 0.4, opacity: 0 }}
                            animate={{ scaleY: [0.4, 1.2, 0.6], opacity: [0, 0.9, 0] }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                        >
                            <svg width="20" height="28" viewBox="0 0 20 28">
                                <defs>
                                    <linearGradient id="thrust" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.9" />
                                        <stop offset="60%" stopColor="#0099FF" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#0033FF" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M2 0 Q10 6 10 28 Q10 6 18 0 Z" fill="url(#thrust)" />
                            </svg>
                        </motion.div>
                    )}

                    {/* Scan beam during scan phase */}
                    {phase === 'scan' && (
                        <motion.div
                            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-px origin-top"
                            initial={{ scaleY: 0, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            style={{
                                height: 48,
                                background: 'linear-gradient(to bottom, rgba(0,245,255,0.6), transparent)',
                            }}
                        />
                    )}
                </motion.div>
            </div>

            {/* ── Glitch terminal text ── */}
            <motion.div
                className="flex flex-col gap-3 mb-10 w-full max-w-sm px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {LINES.map((line, i) => (
                    <GlitchLine
                        key={i}
                        text={line.text}
                        color={line.color}
                        startDelay={line.delay}
                    />
                ))}
            </motion.div>

            {/* ── Progress bar ── */}
            <motion.div
                className="w-full max-w-sm px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex justify-between mb-1">
                    <span className="terminal-text text-[9px] text-accent-cyan/30 tracking-widest uppercase">Boot Sequence</span>
                    <span className="terminal-text text-[9px] text-accent-cyan/60 tracking-widest">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1 bg-bg-tertiary/50 rounded overflow-hidden">
                    <motion.div
                        className="h-full rounded"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #00F5FF, #00FF88)',
                            boxShadow: '0 0 8px rgba(0,245,255,0.6)',
                            transition: 'width 0.05s linear',
                        }}
                    />
                </div>
            </motion.div>

            {/* ── Bottom label ── */}
            <motion.div
                className="absolute bottom-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <span className="terminal-text text-[9px] text-text-secondary/20 tracking-[0.4em] uppercase">
                    ISRO · AI MISSION CONTROL
                </span>
            </motion.div>
        </motion.div>
    );
}
