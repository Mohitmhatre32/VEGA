'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, FileDown, Loader2, ImageOff, CheckCircle2,
} from 'lucide-react';
import { useImageContext } from '@/lib/ImageContext';
import { generateAnalysisReport } from '@/lib/generateReport';


// ── Component ─────────────────────────────────────────────────────────────────

export function ClassificationVisualization() {
  const { uploadedImageUrl } = useImageContext();
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportDone(false);
    try {
      // generateAnalysisReport accepts an "uploads" array.
      // When called from here we pass an empty array — the PDF will still
      // render with the mission-control cover + aggregate page.
      // If you want to pass real upload data, lift state to context.
      await generateAnalysisReport([]);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="relative py-16 px-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-green/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Section header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-px bg-accent-green/60" />
          <span className="terminal-text text-xs tracking-widest text-accent-green/60 uppercase">
            Classification · Overlay Viewer
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-accent-green/20 to-transparent" />
        </div>

        {/* ── Title + Export button — one flex row, properly aligned ── */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary tracking-wider mb-1">
              CLASSIFICATION OVERLAY
            </h2>
            <p className="terminal-text text-xs text-text-secondary/50 tracking-wider">
              Live terrain classification map · upload an image to activate
            </p>
          </div>

          {/* Export Report button — flex-shrink-0 so it never wraps awkwardly */}
          <motion.button
            whileHover={!isExporting ? { scale: 1.02, y: -1 } : {}}
            whileTap={!isExporting ? { scale: 0.98 } : {}}
            onClick={handleExport}
            disabled={isExporting}
            className="flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded border transition-all"
            style={{
              borderColor: exportDone
                ? 'rgba(0,255,136,0.5)'
                : isExporting
                  ? 'rgba(0,245,255,0.2)'
                  : 'rgba(0,245,255,0.35)',
              background: exportDone
                ? 'rgba(0,255,136,0.07)'
                : isExporting
                  ? 'rgba(0,245,255,0.03)'
                  : 'rgba(0,245,255,0.06)',
              boxShadow: isExporting || exportDone ? 'none' : '0 0 12px rgba(0,245,255,0.06)',
            }}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 text-accent-cyan animate-spin" />
            ) : exportDone ? (
              <CheckCircle2 className="w-4 h-4 text-accent-green" />
            ) : (
              <FileDown className="w-4 h-4 text-accent-cyan" />
            )}
            <span
              className="terminal-text text-xs tracking-widest"
              style={{
                color: exportDone
                  ? 'rgba(0,255,136,0.9)'
                  : isExporting
                    ? 'rgba(0,245,255,0.4)'
                    : 'rgba(0,245,255,0.85)',
              }}
            >
              {isExporting ? 'GENERATING…' : exportDone ? 'DOWNLOADED' : 'EXPORT REPORT'}
            </span>
          </motion.button>
        </div>

        {/* ── Main panel ─────────────────────────────────────────────── */}
        <div className="w-full">

          {/* Image / map area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded border border-accent-green/20 overflow-hidden"
            style={{
              background: 'rgba(14,22,40,0.7)',
              backdropFilter: 'blur(8px)',
              minHeight: 380,
            }}
          >
            {/* Monitor chrome strip */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-accent-green/10">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent-red/50" />
                <div className="w-2 h-2 rounded-full bg-accent-orange/50" />
                <div className="w-2 h-2 rounded-full bg-accent-green/50" />
              </div>
              <span className="terminal-text text-[10px] text-text-secondary/30 tracking-widest">
                TERRAIN · CLASSIFICATION · OVERLAY
              </span>
              {uploadedImageUrl && (
                <div className="pulse-dot" style={{ width: 5, height: 5 }} />
              )}
            </div>

            <AnimatePresence mode="wait">
              {uploadedImageUrl ? (
                /* Uploaded image */
                <motion.div
                  key="image"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full"
                  style={{ minHeight: 400 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded satellite image"
                    className="w-full h-full object-cover"
                    style={{ minHeight: 400, maxHeight: 600 }}
                  />
                  {/* Overlay grid */}
                  <div className="absolute inset-0 geo-grid opacity-20 pointer-events-none" />
                  {/* Corner targeting */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-accent-green/60" />
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-accent-green/60" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-accent-green/60" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-accent-green/60" />
                  {/* Status overlay */}
                  <div
                    className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded border border-accent-green/30"
                    style={{ background: 'rgba(7,11,20,0.8)', backdropFilter: 'blur(8px)' }}
                  >
                    <div className="pulse-dot" style={{ width: 5, height: 5 }} />
                    <span className="terminal-text text-[10px] text-accent-green tracking-widest">
                      LIVE · CLASSIFICATION ACTIVE
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* Empty state */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-5 py-24 px-6 text-center"
                  style={{ minHeight: 400 }}
                >
                  <div
                    className="p-5 rounded border border-accent-green/20 bg-accent-green/5"
                    style={{ boxShadow: '0 0 30px rgba(0,255,136,0.05)' }}
                  >
                    <Map className="w-8 h-8 text-accent-green/50" />
                  </div>
                  <div>
                    <p className="terminal-text text-sm text-text-secondary/50 tracking-wider mb-1">
                      AWAITING SATELLITE IMAGERY
                    </p>
                    <p className="terminal-text text-xs text-text-secondary/30 tracking-wide">
                      Upload an image in the ↑ UPLOAD panel to activate the overlay viewer
                    </p>
                  </div>
                  <ImageOff className="w-4 h-4 text-text-secondary/20" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
