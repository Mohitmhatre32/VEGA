'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import type { ChangeDetectionResult } from '@/lib/classificationApi';

// ── Colour map ─────────────────────────────────────────────────────────────────
const CLASS_COLORS: Record<string, string> = {
    Urban: '#FF2E63',
    Forest: '#00FF88',
    Water: '#00F5FF',
    Agriculture: '#FFB800',
    Barren: '#8B6914',
};
const getColor = (cls: string) => CLASS_COLORS[cls] ?? '#94A3B8';

interface Props {
    result: ChangeDetectionResult;
}

export function ChangeDetectionResultCard({ result }: Props) {
    const { year1_prediction, year2_prediction, area_stats } = result.report;

    // max of either year's km² — used to normalise the bars
    const maxKm2 = Math.max(...area_stats.flatMap((s) => [s.year1_area_km2, s.year2_area_km2]), 1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mt-6 rounded border border-accent-orange/25 overflow-hidden"
            style={{ background: 'rgba(14,22,40,0.88)' }}
        >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-accent-orange/15">
                <span className="terminal-text text-[10px] text-accent-orange tracking-widest uppercase">
                    Change Detection Complete
                </span>
                <span className="terminal-text text-[10px] text-text-secondary/40">{result.message}</span>
            </div>

            {/* ── Prediction summary ── */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-5 border-b border-accent-orange/10">
                {/* Year 1 */}
                <div className="text-center">
                    <p className="terminal-text text-[10px] text-text-secondary/40 tracking-widest mb-1">YEAR 1</p>
                    <p
                        className="font-display text-xl font-bold tracking-widest"
                        style={{ color: getColor(year1_prediction) }}
                    >
                        {year1_prediction.toUpperCase()}
                    </p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-1">
                    <ArrowRight className="w-5 h-5 text-accent-orange/50" />
                    <span className="terminal-text text-[9px] text-text-secondary/30 tracking-widest">TEMPORAL SHIFT</span>
                </div>

                {/* Year 2 */}
                <div className="text-center">
                    <p className="terminal-text text-[10px] text-text-secondary/40 tracking-widest mb-1">YEAR 2</p>
                    <p
                        className="font-display text-xl font-bold tracking-widest"
                        style={{ color: getColor(year2_prediction) }}
                    >
                        {year2_prediction.toUpperCase()}
                    </p>
                </div>
            </div>

            {/* ── Area stats table ── */}
            <div className="px-5 py-5">
                <p className="terminal-text text-[10px] text-accent-orange/60 tracking-widest uppercase mb-4">
                    Per-Class Area Statistics
                </p>

                <div className="space-y-4">
                    {area_stats.map((stat, i) => {
                        const color = getColor(stat.class);
                        const isIncreasing = stat.trend === 'increasing';

                        return (
                            <motion.div
                                key={stat.class}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * i }}
                            >
                                {/* Class label + trend + change_pct */}
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}80` }}
                                        />
                                        <span className="terminal-text text-xs text-text-secondary/70 tracking-wider">
                                            {stat.class.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isIncreasing
                                            ? <TrendingUp className="w-3 h-3 text-accent-green" />
                                            : <TrendingDown className="w-3 h-3 text-accent-red" />}
                                        <span
                                            className="terminal-text text-[10px] font-bold tracking-widest"
                                            style={{ color: isIncreasing ? '#00FF88' : '#FF2E63' }}
                                        >
                                            {stat.change_pct}
                                        </span>
                                    </div>
                                </div>

                                {/* Dual bar: Year 1 (muted) + Year 2 (bright) */}
                                <div className="flex flex-col gap-1">
                                    {[
                                        { label: 'Y1', km2: stat.year1_area_km2, opacity: '60' },
                                        { label: 'Y2', km2: stat.year2_area_km2, opacity: 'ff' },
                                    ].map(({ label, km2, opacity }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <span className="terminal-text text-[9px] text-text-secondary/30 w-4 flex-shrink-0">
                                                {label}
                                            </span>
                                            <div className="flex-1 h-1 bg-bg-tertiary/30 rounded overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded"
                                                    style={{ backgroundColor: `${color}${opacity}` }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(km2 / maxKm2) * 100}%` }}
                                                    transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 + 0.05 * i }}
                                                />
                                            </div>
                                            <span className="terminal-text text-[9px] text-text-secondary/40 w-20 text-right flex-shrink-0">
                                                {km2.toLocaleString()} km²
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
