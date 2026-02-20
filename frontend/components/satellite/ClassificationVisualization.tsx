'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToggleLeft, ToggleRight, ImageOff } from 'lucide-react';
import { classificationResults } from '@/lib/mockData';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { useImageContext } from '@/lib/ImageContext';

const OVERLAY_COLORS: Record<string, string> = {
  Forest: 'rgba(0,255,80,0.45)',
  Water: 'rgba(0,100,255,0.45)',
  Urban: 'rgba(255,46,99,0.45)',
  Agriculture: 'rgba(255,184,0,0.45)',
  Barren: 'rgba(139,90,43,0.45)',
};

const LEGEND = [
  { label: 'Forest', color: '#00FF50' },
  { label: 'Water', color: '#0064FF' },
  { label: 'Urban', color: '#FF2E63' },
  { label: 'Agriculture', color: '#FFB800' },
  { label: 'Barren', color: '#8B5A2B' },
];

const TERRAIN_TYPES = [
  'Forest', 'Water', 'Urban', 'Agriculture', 'Barren',
  'Forest', 'Forest', 'Agriculture', 'Water', 'Barren',
  'Urban', 'Water', 'Forest', 'Agriculture', 'Forest',
  'Agriculture', 'Barren', 'Urban', 'Forest', 'Water',
];

const AI_LABELS = [
  { label: 'FOREST', x: '10%', y: '15%' },
  { label: 'WATER', x: '58%', y: '10%' },
  { label: 'URBAN', x: '5%', y: '65%' },
  { label: 'AGRI', x: '65%', y: '70%' },
];

export function ClassificationVisualization() {
  const [showAI, setShowAI] = useState(false);
  const { uploadedImageUrl } = useImageContext();

  return (
    <section className="relative py-16 px-4">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-accent-green/4 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-px bg-accent-green/60" />
          <span className="terminal-text text-xs tracking-widest text-accent-green/60 uppercase">
            Screen 2 · Classification Overlay
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-accent-green/20 to-transparent" />
        </div>

        {/* Toggle row */}
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-wider">
            TERRAIN INTELLIGENCE MAP
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
                {/* Thumbnail */}
                <img
                  src={uploadedImageUrl}
                  alt="uploaded preview"
                  className="w-5 h-5 rounded-sm object-cover border border-accent-cyan/20"
                />
                <span className="terminal-text text-[10px] text-accent-cyan/70 tracking-widest uppercase">
                  Image Loaded
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="flex items-center gap-2 ml-auto p-2 rounded border border-accent-green/20"
            style={{ background: 'rgba(14,22,40,0.8)', backdropFilter: 'blur(8px)' }}
          >
            <span className="terminal-text text-xs text-text-secondary/60 tracking-widest">RAW IMAGE</span>
            <button onClick={() => setShowAI(!showAI)} className="text-accent-cyan relative">
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
            {/* Corner brackets */}
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-accent-cyan/60 z-20" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-accent-cyan/60 z-20" />

            <div className="w-full h-full relative">

              {/* ── Uploaded image layer (base) ── */}
              <AnimatePresence>
                {uploadedImageUrl ? (
                  <motion.img
                    key="uploaded-img"
                    src={uploadedImageUrl}
                    alt="satellite imagery"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ filter: showAI ? 'brightness(0.55) saturate(0.6)' : 'brightness(0.9)' }}
                  />
                ) : (
                  /* Default: terrain block placeholder */
                  <motion.div
                    key="placeholder"
                    className="absolute inset-0 grid grid-cols-5 grid-rows-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {TERRAIN_TYPES.map((type, i) => (
                      <div
                        key={i}
                        style={{
                          background: showAI
                            ? OVERLAY_COLORS[type] ?? 'rgba(100,100,100,0.3)'
                            : 'rgba(20,28,50,0.8)',
                        }}
                        className="transition-all duration-500 border border-accent-cyan/5"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── AI colour overlay (on top of image) ── */}
              <AnimatePresence>
                {showAI && uploadedImageUrl && (
                  <motion.div
                    key="ai-overlay"
                    className="absolute inset-0 grid grid-cols-5 grid-rows-4 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {TERRAIN_TYPES.map((type, i) => (
                      <div
                        key={i}
                        className="transition-colors duration-500"
                        style={{ background: OVERLAY_COLORS[type] ?? 'rgba(100,100,100,0.3)' }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Geo grid */}
              <div className="absolute inset-0 geo-grid opacity-60 z-[15]" />

              {/* ── AI label overlay ── */}
              <AnimatePresence>
                {showAI && (
                  <motion.div
                    key="ai-labels"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 z-20 pointer-events-none"
                  >
                    {AI_LABELS.map(({ label, x, y }) => (
                      <div
                        key={label}
                        className="absolute terminal-text text-[9px] text-white/80 tracking-widest bg-black/40 border border-white/10 px-1.5 py-0.5 rounded"
                        style={{ left: x, top: y }}
                      >
                        {label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Empty state ── */}
              <AnimatePresence>
                {!uploadedImageUrl && !showAI && (
                  <motion.div
                    key="empty-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                  {uploadedImageUrl
                    ? showAI ? 'AI SEGMENTATION ACTIVE' : 'RAW UPLOAD · SENSOR DATA'
                    : showAI ? 'AI SEGMENTATION ACTIVE' : 'RAW SENSOR DATA'}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex flex-col gap-4">
            {/* Color legend */}
            <div
              className="p-4 rounded border border-accent-cyan/10"
              style={{ background: 'rgba(14,22,40,0.8)', backdropFilter: 'blur(8px)' }}
            >
              <h3 className="terminal-text text-[10px] tracking-widest text-accent-cyan/50 uppercase mb-3">
                Classification Legend
              </h3>
              <div className="space-y-2">
                {LEGEND.map(({ label, color }) => (
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

            {/* Confidence scores */}
            <div
              className="p-4 rounded border border-accent-cyan/10 flex-1"
              style={{ background: 'rgba(14,22,40,0.6)' }}
            >
              <h3 className="terminal-text text-[10px] tracking-widest text-accent-cyan/50 uppercase mb-3">
                Confidence Scores
              </h3>
              <div className="space-y-4">
                {classificationResults.map((result, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="terminal-text text-xs text-text-secondary">{result.terrainType}</span>
                      <span className="terminal-text text-xs text-accent-cyan">{result.area.toLocaleString()} km²</span>
                    </div>
                    <ConfidenceBar value={result.confidence} color={result.color} label="" />
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
