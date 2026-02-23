'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToggleLeft, ToggleRight, ImageOff } from 'lucide-react';
import { useImageContext } from '@/lib/ImageContext';
import type { GridPatch } from '@/lib/classificationApi';

// ── Colour map — exact class names from the backend model ─────────────────────

const CLASS_COLORS: Record<string, string> = {
    'Agricultural Land': 'rgba(255,200,0,0.50)',
    'Urban Area': 'rgba(255,46,99,0.50)',
    'Forest': 'rgba(0,200,80,0.50)',
    'Water Body': 'rgba(0,100,255,0.50)',
    'Barren Land': 'rgba(180,100,40,0.50)',
    'Shadow': 'rgba(20,20,40,0.65)',
};

const FULL_LEGEND = [
    { label: 'Agricultural Land', color: '#FFC800' },
    { label: 'Urban Area', color: '#FF2E63' },
    { label: 'Forest', color: '#00C850' },
    { label: 'Water Body', color: '#0064FF' },
    { label: 'Barren Land', color: '#B46428' },
    { label: 'Shadow', color: '#14142A' },
];

// 4×5 fallback demo grid for the empty state
const MOCK_TERRAIN = [
    'Forest', 'Water Body', 'Urban Area', 'Agricultural Land', 'Barren Land',
    'Forest', 'Forest', 'Agricultural Land', 'Water Body', 'Barren Land',
    'Urban Area', 'Water Body', 'Forest', 'Agricultural Land', 'Forest',
    'Agricultural Land', 'Barren Land', 'Urban Area', 'Forest', 'Water Body',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeStats(grid: GridPatch[]) {
    const acc: Record<string, { n: number; conf: number }> = {};
    for (const p of grid) {
        if (!acc[p.class]) acc[p.class] = { n: 0, conf: 0 };
        acc[p.class].n++;
        acc[p.class].conf += p.confidence;
    }
    return Object.entries(acc)
        .map(([cls, { n, conf }]) => ({
            cls,
            pct: Math.round((n / grid.length) * 100),
            avgConf: Math.round(conf / n),
        }))
        .sort((a, b) => b.pct - a.pct);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ClassificationVisualization() {
    const [showAI, setShowAI] = useState(false);
    const { uploadedImageUrl, mapAnalysis } = useImageContext();

    /**
     * One <div> per patch, absolutely positioned with % coords so it scales to any image size:
     *   left  = (x / image_width)  × 100%
     *   top   = (y / image_height) × 100%
     *   width = (patch_size / image_width)  × 100%
     *   height= (patch_size / image_height) × 100%
     */
    const realOverlay = useMemo(() => {
        if (!mapAnalysis) return null;
        const { image_width, image_height, patch_size, grid } = mapAnalysis;
        return grid.map(patch => (
            <div
                key={`${patch.x}-${patch.y}`}
                className="absolute"
                title={`${patch.class} · ${patch.confidence}%`}
                style={{
                    left: `${(patch.x / image_width) * 100}%`,
                    top: `${(patch.y / image_height) * 100}%`,
                    width: `${(patch_size / image_width) * 100}%`,
                    height: `${(patch_size / image_height) * 100}%`,
                    background: CLASS_COLORS[patch.class] ?? 'rgba(100,100,100,0.35)',
                }}
            />
        ));
    }, [mapAnalysis]);

    const stats = useMemo(
        () => (mapAnalysis ? computeStats(mapAnalysis.grid) : null),
        [mapAnalysis],
    );

    const legend = useMemo(() => {
        if (!mapAnalysis) return FULL_LEGEND;
        const present = new Set(mapAnalysis.grid.map(p => p.class));
        return FULL_LEGEND.filter(l => present.has(l.label));
    }, [mapAnalysis]);

    return (
        <section className="relative py-16 px-4">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/3 w-64 h-64 bg-accent-green/4 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-px bg-accent-green/60" />
                    <span className="terminal-text text-xs tracking-widest text-accent-green/60 uppercase">
                        Classification · Overlay Viewer
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-accent-green/20 to-transparent" />
                </div>

                {/* Title row */}
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-display text-2xl font-bold text-text-primary tracking-wider">
                        CLASSIFICATION OVERLAY
                    </h2>

                    {/* Uploaded image badge */}
                    <AnimatePresence>
                        {uploadedImageUrl && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded border border-accent-cyan/30"
                                style={{ background: 'rgba(0,245,255,0.06)', backdropFilter: 'blur(8px)' }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={uploadedImageUrl}
                                    alt="preview"
                                    className="w-5 h-5 rounded-sm object-cover border border-accent-cyan/20"
                                />
                                <span className="terminal-text text-[10px] text-accent-cyan/70 tracking-widest uppercase">
                                    {mapAnalysis ? `${mapAnalysis.grid.length} patches mapped` : 'Analyzing…'}
                                </span>
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${mapAnalysis ? 'bg-accent-green' : 'bg-accent-cyan'}`} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* AI toggle */}
                    <div
                        className="flex items-center gap-2 ml-auto p-2 rounded border border-accent-green/20"
                        style={{ background: 'rgba(14,22,40,0.8)', backdropFilter: 'blur(8px)' }}
                    >
                        <span className="terminal-text text-xs text-text-secondary/60 tracking-widest">RAW IMAGE</span>
                        <button onClick={() => setShowAI(!showAI)}>
                            {showAI
                                ? <ToggleRight className="w-8 h-8 text-accent-green" />
                                : <ToggleLeft className="w-8 h-8 text-text-secondary/40" />}
                        </button>
                        <span className={`terminal-text text-xs tracking-widest ${showAI ? 'text-accent-green' : 'text-text-secondary/40'}`}>
                            AI TERRAIN MAP
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

                    {/* ── Main viewer ── */}
                    <div
                        className="monitor-frame relative overflow-hidden rounded"
                        style={{ border: '1px solid rgba(0,245,255,0.2)', background: '#0B0F1A', aspectRatio: '16/9' }}
                    >
                        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-accent-cyan/60 z-20" />
                        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-accent-cyan/60 z-20" />

                        <div className="w-full h-full relative">

                            {/* Base image / placeholder */}
                            <AnimatePresence>
                                {uploadedImageUrl ? (
                                    <motion.img
                                        key="img"
                                        src={uploadedImageUrl}
                                        alt="satellite"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ filter: showAI ? 'brightness(0.5) saturate(0.5)' : 'brightness(0.9)' }}
                                    />
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        className="absolute inset-0 grid grid-cols-5 grid-rows-4"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    >
                                        {MOCK_TERRAIN.map((type, i) => (
                                            <div
                                                key={i}
                                                className="border border-accent-cyan/5 transition-all duration-500"
                                                style={{ background: showAI ? CLASS_COLORS[type] ?? 'rgba(100,100,100,0.3)' : 'rgba(20,28,50,0.8)' }}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── AI colour overlay ── */}
                            <AnimatePresence>
                                {showAI && uploadedImageUrl && (
                                    <motion.div
                                        key="ai-overlay"
                                        className="absolute inset-0 z-10"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {realOverlay ?? (
                                            /* Loading fallback while analysis is still running */
                                            <div className="w-full h-full grid grid-cols-5 grid-rows-4">
                                                {MOCK_TERRAIN.map((type, i) => (
                                                    <div key={i} style={{ background: CLASS_COLORS[type] ?? 'rgba(100,100,100,0.3)' }} />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Geo grid */}
                            <div className="absolute inset-0 geo-grid opacity-60 z-[15]" />

                            {/* Empty state hint */}
                            <AnimatePresence>
                                {!uploadedImageUrl && !showAI && (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 pointer-events-none"
                                    >
                                        <ImageOff className="w-8 h-8 text-accent-cyan/15" />
                                        <span className="terminal-text text-[10px] text-accent-cyan/20 tracking-widest uppercase">
                                            Upload an image to populate this viewer
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Mode label */}
                            <div className="absolute bottom-3 right-3 z-30">
                                <div className="terminal-text text-[10px] tracking-widest bg-black/60 border border-accent-cyan/20 px-2 py-1 rounded">
                                    {showAI
                                        ? mapAnalysis
                                            ? `AI SEGMENTATION · ${mapAnalysis.grid.length} PATCHES`
                                            : 'AI SEGMENTATION ACTIVE'
                                        : uploadedImageUrl
                                            ? 'RAW UPLOAD · SENSOR DATA'
                                            : 'RAW SENSOR DATA'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right panel ── */}
                    <div className="flex flex-col gap-4">

                        {/* Legend */}
                        <div
                            className="p-4 rounded border border-accent-cyan/10"
                            style={{ background: 'rgba(14,22,40,0.8)', backdropFilter: 'blur(8px)' }}
                        >
                            <h3 className="terminal-text text-[10px] tracking-widest text-accent-cyan/50 uppercase mb-3">
                                Classification Legend
                            </h3>
                            <div className="space-y-2">
                                {legend.map(({ label, color }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <motion.div
                                            animate={{ opacity: showAI ? 1 : 0.3 }}
                                            className="w-3 h-3 rounded-sm flex-shrink-0"
                                            style={{ background: color, boxShadow: showAI ? `0 0 6px ${color}80` : 'none' }}
                                        />
                                        <span className="terminal-text text-xs text-text-secondary tracking-wider">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coverage breakdown / AI stats */}
                        <div
                            className="p-4 rounded border border-accent-cyan/10 flex-1"
                            style={{ background: 'rgba(14,22,40,0.6)' }}
                        >
                            <h3 className="terminal-text text-[10px] tracking-widest text-accent-cyan/50 uppercase mb-3">
                                {stats ? 'Coverage Breakdown' : 'Awaiting Analysis'}
                            </h3>
                            <div className="space-y-3">
                                {stats
                                    ? stats.map(({ cls, pct, avgConf }) => (
                                        <div key={cls}>
                                            <div className="flex justify-between mb-1">
                                                <span className="terminal-text text-xs text-text-secondary truncate max-w-[150px]">{cls}</span>
                                                <span className="terminal-text text-xs text-accent-cyan">{pct}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-bg-tertiary/40 rounded overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded"
                                                    style={{
                                                        background: CLASS_COLORS[cls] ?? '#888',
                                                        boxShadow: `0 0 4px ${CLASS_COLORS[cls] ?? '#888'}80`,
                                                    }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                                />
                                            </div>
                                            <p className="text-right terminal-text text-[9px] text-text-secondary/30 mt-0.5">
                                                avg confidence {avgConf}%
                                            </p>
                                        </div>
                                    ))
                                    : ['Agricultural Land', 'Urban Area', 'Forest', 'Water Body', 'Barren Land'].map(cls => (
                                        <div key={cls}>
                                            <div className="flex justify-between mb-1">
                                                <span className="terminal-text text-xs text-text-secondary">{cls}</span>
                                                <span className="terminal-text text-xs text-text-secondary/30">—</span>
                                            </div>
                                            <div className="w-full h-1 bg-bg-tertiary/40 rounded" />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
