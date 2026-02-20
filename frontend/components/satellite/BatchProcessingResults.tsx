'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Upload, FileImage, X, AlertTriangle,
  Loader2, CheckCircle2, BarChart2, Hash,
} from 'lucide-react';
import { predictBatch, type BatchPredictionResult } from '@/lib/classificationApi';

// ── Colour map for the 5 ISRO terrain classes ─────────────────────────────────
const CLASS_COLORS: Record<string, string> = {
  Urban: '#0099FF',
  Forest: '#00FF50',
  Water: '#00F5FF',
  Agriculture: '#FFB800',
  Barren: '#8B6914',
};
const getColor = (cls: string) => CLASS_COLORS[cls] ?? '#94A3B8';

// ── Types ──────────────────────────────────────────────────────────────────────
type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface QueuedFile {
  id: string;
  name: string;
  size: number;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function BatchProcessingResults() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [result, setResult] = useState<BatchPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Keep the actual File objects in a separate ref so we can pass them to the API
  const fileListRef = useRef<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── file selection ──────────────────────────────────────────────────────────

  const stageFiles = (files: File[]) => {
    if (!files.length) return;
    fileListRef.current = [...fileListRef.current, ...files];
    setQueuedFiles((prev) => [
      ...prev,
      ...files.map((f) => ({ id: crypto.randomUUID(), name: f.name, size: f.size })),
    ]);
    // Reset any previous result / error
    setResult(null);
    setError(null);
    setUploadState('idle');
  };

  const removeFile = (id: string) => {
    const idx = queuedFiles.findIndex((q) => q.id === id);
    if (idx === -1) return;
    fileListRef.current.splice(idx, 1);
    setQueuedFiles((prev) => prev.filter((q) => q.id !== id));
  };

  const clearAll = () => {
    fileListRef.current = [];
    setQueuedFiles([]);
    setResult(null);
    setError(null);
    setUploadState('idle');
  };

  // ── drag handlers ───────────────────────────────────────────────────────────

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    stageFiles(Array.from(e.dataTransfer.files));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    stageFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  };

  // ── run batch predict ───────────────────────────────────────────────────────

  const runBatch = async () => {
    if (!fileListRef.current.length) return;
    try {
      setUploadState('uploading');
      await new Promise((r) => setTimeout(r, 400));   // brief visual "uploading" beat
      setUploadState('processing');

      const data = await predictBatch(fileListRef.current);

      setResult(data);
      setUploadState('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUploadState('error');
    }
  };

  // ── derived ─────────────────────────────────────────────────────────────────

  const isLoading = uploadState === 'uploading' || uploadState === 'processing';
  const distribution = result?.stats.distribution ?? {};
  const totalProcessed = result?.stats.total_processed ?? 0;

  // sort distribution by count descending
  const sortedClasses = Object.entries(distribution).sort(([, a], [, b]) => b - a);
  const maxCount = sortedClasses[0]?.[1] ?? 1;

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <section className="relative py-16 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-accent-green/3 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-px bg-accent-green/60" />
          <span className="terminal-text text-xs tracking-widest text-accent-green/60 uppercase">
            Batch Protocol · Queue Monitor
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-accent-green/20 to-transparent" />
        </div>

        <h2 className="font-display text-2xl font-bold text-text-primary tracking-wider mb-2">
          BATCH PROCESSING
        </h2>
        <p className="terminal-text text-xs text-text-secondary/50 tracking-wider mb-8">
          Upload multiple satellite images in one shot — processed server-side as a single batch
        </p>

        {/* ── Drop zone ── */}
        <motion.div
          animate={{
            borderColor: isDragActive ? 'rgba(0,255,136,0.7)' : 'rgba(0,255,136,0.2)',
            background: isDragActive ? 'rgba(0,255,136,0.05)' : 'rgba(14,22,40,0.5)',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="relative p-10 rounded border-2 border-dashed cursor-pointer"
          style={{
            boxShadow: isDragActive
              ? '0 0 24px rgba(0,255,136,0.15), inset 0 0 24px rgba(0,255,136,0.04)'
              : 'none',
          }}
        >
          {isDragActive && <div className="absolute inset-0 geo-grid rounded opacity-40" />}

          <div className="relative z-10 flex flex-col items-center gap-5 text-center pointer-events-none">
            <motion.div
              animate={{ y: isDragActive ? -8 : 0, scale: isDragActive ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="p-4 rounded border border-accent-green/30 bg-accent-green/5"
            >
              <Layers className="w-7 h-7 text-accent-green" />
            </motion.div>

            <div>
              <p className="terminal-text text-sm text-text-primary tracking-wider mb-1">
                {isDragActive ? 'RELEASE TO STAGE FILES' : 'DROP MULTIPLE FILES OR CLICK TO SELECT'}
              </p>
              <p className="terminal-text text-xs text-text-secondary/40 tracking-wide">
                GeoTIFF · PNG · JPEG — all files sent as one batch request
              </p>
            </div>

            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-accent-green/40" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-accent-green/40" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-accent-green/40" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-accent-green/40" />
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".tif,.tiff,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleInput}
          />
        </motion.div>

        {/* ── Staged file list ── */}
        <AnimatePresence>
          {queuedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="terminal-text text-[10px] text-accent-green/60 tracking-widest uppercase">
                  Staged Files · {queuedFiles.length} image{queuedFiles.length !== 1 ? 's' : ''}
                </h3>
                <button
                  onClick={clearAll}
                  className="terminal-text text-[10px] text-text-secondary/40 hover:text-red-400 tracking-widest transition-colors"
                >
                  CLEAR ALL
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {queuedFiles.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded border border-accent-green/15"
                    style={{ background: 'rgba(14,22,40,0.7)' }}
                  >
                    <FileImage className="w-4 h-4 text-accent-green/50 flex-shrink-0" />
                    <span className="terminal-text text-xs text-text-secondary truncate flex-1">
                      {f.name}
                    </span>
                    <span className="terminal-text text-[10px] text-text-secondary/30 flex-shrink-0">
                      {(f.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      onClick={() => removeFile(f.id)}
                      disabled={isLoading}
                      className="text-text-secondary/30 hover:text-red-400 transition-colors disabled:opacity-30"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Run batch button */}
              <motion.button
                whileHover={!isLoading ? { scale: 1.01 } : {}}
                whileTap={!isLoading ? { scale: 0.99 } : {}}
                onClick={runBatch}
                disabled={isLoading}
                className="w-full py-3 rounded border transition-all"
                style={{
                  borderColor: isLoading ? 'rgba(0,255,136,0.15)' : 'rgba(0,255,136,0.5)',
                  background: isLoading ? 'rgba(0,255,136,0.04)' : 'rgba(0,255,136,0.08)',
                  color: isLoading ? 'rgba(0,255,136,0.4)' : 'rgba(0,255,136,0.9)',
                  boxShadow: isLoading ? 'none' : '0 0 16px rgba(0,255,136,0.08)',
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="terminal-text text-xs tracking-widest">
                        {uploadState === 'uploading' ? 'UPLOADING…' : 'PROCESSING BATCH…'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span className="terminal-text text-xs tracking-widest">
                        RUN BATCH · {queuedFiles.length} FILE{queuedFiles.length !== 1 ? 'S' : ''}
                      </span>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex items-start gap-3 px-4 py-3 rounded border border-red-500/30"
              style={{ background: 'rgba(255,46,99,0.07)' }}
            >
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="terminal-text text-[10px] text-red-400 tracking-widest uppercase mb-0.5">
                  Batch Failed
                </p>
                <p className="terminal-text text-xs text-red-400/70">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Batch Result Card ── */}
        <AnimatePresence>
          {result && uploadState === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="mt-6 rounded border border-accent-green/25 overflow-hidden"
              style={{ background: 'rgba(14,22,40,0.85)' }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-accent-green/15">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-green" />
                  <span className="terminal-text text-xs text-accent-green tracking-widest uppercase">
                    Batch Complete
                  </span>
                </div>
                <span className="terminal-text text-[10px] text-text-secondary/40 tracking-widest">
                  {result.message}
                </span>
              </div>

              {/* Summary numbers */}
              <div className="grid grid-cols-2 divide-x divide-accent-green/10 border-b border-accent-green/10">
                <div className="px-5 py-4">
                  <p className="terminal-text text-[10px] text-text-secondary/40 tracking-widest mb-1">
                    TOTAL PROCESSED
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="font-display text-4xl font-bold text-accent-green">
                      {totalProcessed}
                    </span>
                    <span className="terminal-text text-xs text-text-secondary/40 mb-1 tracking-wider">
                      image{totalProcessed !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p className="terminal-text text-[10px] text-text-secondary/40 tracking-widest mb-1">
                    CLASSES DETECTED
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="font-display text-4xl font-bold text-accent-cyan">
                      {sortedClasses.filter(([, c]) => c > 0).length}
                    </span>
                    <span className="terminal-text text-xs text-text-secondary/40 mb-1 tracking-wider">
                      classes
                    </span>
                  </div>
                </div>
              </div>

              {/* Per-class distribution */}
              <div className="px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-3.5 h-3.5 text-accent-green/60" />
                  <span className="terminal-text text-[10px] text-accent-green/60 tracking-widest uppercase">
                    Class Distribution
                  </span>
                </div>

                <div className="space-y-3">
                  {sortedClasses.map(([cls, count], i) => (
                    <motion.div
                      key={cls}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-center gap-3"
                    >
                      {/* Colour dot */}
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getColor(cls), boxShadow: `0 0 5px ${getColor(cls)}80` }}
                      />

                      {/* Class label */}
                      <span className="terminal-text text-xs text-text-secondary/70 tracking-wider w-24 flex-shrink-0">
                        {cls.toUpperCase()}
                      </span>

                      {/* Bar */}
                      <div className="flex-1 h-1.5 bg-bg-tertiary/30 rounded overflow-hidden">
                        <motion.div
                          className="h-full rounded"
                          style={{
                            backgroundColor: getColor(cls),
                            boxShadow: `0 0 6px ${getColor(cls)}60`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxCount) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 + 0.05 * i }}
                        />
                      </div>

                      {/* Count badge */}
                      <div className="flex items-center gap-1 flex-shrink-0 w-16 justify-end">
                        <Hash className="w-2.5 h-2.5 text-text-secondary/30" />
                        <span
                          className="terminal-text text-xs font-bold"
                          style={{ color: count > 0 ? getColor(cls) : 'rgba(255,255,255,0.2)' }}
                        >
                          {count}
                        </span>
                        <span className="terminal-text text-[10px] text-text-secondary/30">
                          /{totalProcessed}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Dominant class callout */}
                {sortedClasses[0] && sortedClasses[0][1] > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-5 flex items-center gap-3 px-4 py-3 rounded border"
                    style={{
                      borderColor: `${getColor(sortedClasses[0][0])}40`,
                      background: `${getColor(sortedClasses[0][0])}0a`,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getColor(sortedClasses[0][0]) }}
                    />
                    <span className="terminal-text text-[10px] text-text-secondary/50 tracking-widest uppercase">
                      Dominant terrain
                    </span>
                    <span
                      className="terminal-text text-sm font-bold tracking-wider"
                      style={{ color: getColor(sortedClasses[0][0]) }}
                    >
                      {sortedClasses[0][0].toUpperCase()}
                    </span>
                    <span className="terminal-text text-[10px] text-text-secondary/40 ml-auto">
                      {sortedClasses[0][1]} of {totalProcessed} images
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
