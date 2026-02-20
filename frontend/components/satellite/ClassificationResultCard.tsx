'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, BarChart2, FileImage } from 'lucide-react';
import type { PredictionResult } from '@/lib/classificationApi';

// Map class labels to accent colors for the breakdown bars
const CLASS_COLORS: Record<string, string> = {
    Urban: 'bg-accent-blue',
    Forest: 'bg-accent-green',
    Water: 'bg-accent-cyan',
    Agriculture: 'bg-accent-orange',
    Barren: 'bg-text-secondary',
};

const DEFAULT_COLOR = 'bg-accent-cyan';

function getColor(cls: string) {
    return CLASS_COLORS[cls] ?? DEFAULT_COLOR;
}

interface Props {
    result: PredictionResult;
}

export function ClassificationResultCard({ result }: Props) {
    // Parse confidence number from string like "87.43%"
    const confidenceNum = parseFloat(result.confidence);

    // Sort breakdown entries by probability descending
    const breakdown = Object.entries(result.breakdown).sort(([, a], [, b]) => b - a);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mt-6 rounded border border-accent-green/25 overflow-hidden"
            style={{ background: 'rgba(14,22,40,0.85)' }}
        >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-accent-green/15">
                <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-accent-cyan/60" />
                    <span className="terminal-text text-xs text-text-secondary truncate max-w-[240px]">
                        {result.filename}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                    <span className="terminal-text text-[10px] text-accent-green tracking-widest uppercase">
                        Analysis Complete
                    </span>
                </div>
            </div>

            {/* ── Prediction + Confidence ── */}
            <div className="px-5 py-4 border-b border-accent-cyan/10">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="terminal-text text-[10px] text-text-secondary/40 tracking-widest mb-1">
                            PREDICTED CLASS
                        </p>
                        <p className="font-display text-xl font-bold text-text-primary tracking-widest">
                            {result.prediction.toUpperCase()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="terminal-text text-[10px] text-text-secondary/40 tracking-widest mb-1">
                            CONFIDENCE
                        </p>
                        <p
                            className="font-display text-xl font-bold tracking-widest"
                            style={{ color: `hsl(${confidenceNum * 1.2}, 90%, 60%)` }}
                        >
                            {result.confidence}
                        </p>
                    </div>
                </div>

                {/* Confidence bar */}
                <div className="w-full h-1.5 bg-bg-tertiary/40 rounded overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-accent-cyan to-accent-green rounded"
                        initial={{ width: 0 }}
                        animate={{ width: `${confidenceNum}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                        style={{ boxShadow: '0 0 6px rgba(0,245,255,0.5)' }}
                    />
                </div>
            </div>

            {/* ── Breakdown Table ── */}
            <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                    <BarChart2 className="w-3.5 h-3.5 text-accent-cyan/50" />
                    <p className="terminal-text text-[10px] text-accent-cyan/50 tracking-widest uppercase">
                        Class Probability Breakdown
                    </p>
                </div>

                <div className="space-y-2">
                    {breakdown.map(([cls, prob], i) => (
                        <motion.div
                            key={cls}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                            className="flex items-center gap-3"
                        >
                            {/* Label */}
                            <span className="terminal-text text-[10px] text-text-secondary/70 tracking-wider w-24 flex-shrink-0">
                                {cls.toUpperCase()}
                            </span>

                            {/* Bar track */}
                            <div className="flex-1 h-1 bg-bg-tertiary/30 rounded overflow-hidden">
                                <motion.div
                                    className={`h-full rounded ${getColor(cls)}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${prob}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 + i * 0.06 }}
                                />
                            </div>

                            {/* Value */}
                            <span
                                className="terminal-text text-[10px] tracking-widest w-14 text-right flex-shrink-0"
                                style={{
                                    color: cls === result.prediction ? 'rgba(0,245,255,0.9)' : 'rgba(255,255,255,0.3)',
                                }}
                            >
                                {prob.toFixed(1)}%
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
