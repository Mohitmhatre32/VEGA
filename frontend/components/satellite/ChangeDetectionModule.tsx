'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileImage, X, AlertTriangle,
  Loader2, CheckCircle2, Calendar,
} from 'lucide-react';
import { predictChangeDetection, type ChangeDetectionResult } from '@/lib/classificationApi';
import { ChangeDetectionResultCard } from './ChangeDetectionResultCard';

// ── Types ──────────────────────────────────────────────────────────────────────
type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface Slot {
  label: string;      // "YEAR 1" | "YEAR 2"
  subLabel: string;   // "Before" | "After"
  accentColor: string;
}

const SLOTS: Slot[] = [
  { label: 'YEAR 1', subLabel: 'Before / Baseline', accentColor: '#0099FF' },
  { label: 'YEAR 2', subLabel: 'After / Comparison', accentColor: '#FFB800' },
];

// ── File slot picker sub-component ────────────────────────────────────────────
interface FileSlotProps extends Slot {
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
  disabled: boolean;
}

function FileSlot({ label, subLabel, accentColor, file, onFile, onClear, disabled }: FileSlotProps) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(e.type === 'dragenter' || e.type === 'dragover');
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div>
      {/* Slot label */}
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-3.5 h-3.5" style={{ color: accentColor }} />
        <span className="terminal-text text-xs tracking-widest font-bold" style={{ color: accentColor }}>
          {label}
        </span>
        <span className="terminal-text text-[10px] text-text-secondary/40 tracking-wider">{subLabel}</span>
      </div>

      {file ? (
        /* File staged */
        <div
          className="flex items-center gap-3 px-4 py-3 rounded border"
          style={{ background: `${accentColor}08`, borderColor: `${accentColor}30` }}
        >
          <FileImage className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
          <span className="terminal-text text-xs text-text-secondary truncate flex-1">{file.name}</span>
          <span className="terminal-text text-[10px] text-text-secondary/30 flex-shrink-0">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
          {!disabled && (
            <button onClick={onClear} className="text-text-secondary/30 hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* Drop zone */
        <motion.div
          animate={{
            borderColor: drag ? accentColor : `${accentColor}40`,
            background: drag ? `${accentColor}08` : 'rgba(14,22,40,0.5)',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && ref.current?.click()}
          className={`relative p-8 rounded border-2 border-dashed flex flex-col items-center gap-3 text-center ${disabled ? 'opacity-40' : 'cursor-pointer'}`}
        >
          <div className="p-3 rounded border" style={{ borderColor: `${accentColor}30`, background: `${accentColor}08` }}>
            <Upload className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <p className="terminal-text text-xs text-text-secondary/60 tracking-wider">
            {drag ? 'RELEASE TO SET' : 'DROP IMAGE OR CLICK'}
          </p>

          {/* corners */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l" style={{ borderColor: `${accentColor}50` }} />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r" style={{ borderColor: `${accentColor}50` }} />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l" style={{ borderColor: `${accentColor}50` }} />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r" style={{ borderColor: `${accentColor}50` }} />

          <input
            ref={ref}
            type="file"
            accept=".tif,.tiff,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = '';
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ChangeDetectionModule() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [result, setResult] = useState<ChangeDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = uploadState === 'uploading' || uploadState === 'processing';
  const canSubmit = !!file1 && !!file2 && !isLoading;

  const handleClear = () => {
    setFile1(null);
    setFile2(null);
    setResult(null);
    setError(null);
    setUploadState('idle');
  };

  const runDetection = async () => {
    if (!file1 || !file2) return;
    try {
      setError(null);
      setResult(null);
      setUploadState('uploading');
      await new Promise((r) => setTimeout(r, 400));
      setUploadState('processing');

      const data = await predictChangeDetection(file1, file2);

      setResult(data);
      setUploadState('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUploadState('error');
    }
  };

  return (
    <section className="relative py-16 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent-orange/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-px bg-accent-orange/60" />
          <span className="terminal-text text-xs tracking-widest text-accent-orange/60 uppercase">
            Temporal Analysis · Change Detection
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-accent-orange/20 to-transparent" />
        </div>

        <h2 className="font-display text-2xl font-bold text-text-primary tracking-wider mb-2">
          TERRAIN CHANGE DETECTION
        </h2>
        <p className="terminal-text text-xs text-text-secondary/50 tracking-wider mb-8">
          Upload Year 1 and Year 2 satellite images — the AI calculates terrain shift, area change, and trend direction
        </p>

        {/* ── Two-slot upload panel ── */}
        <div
          className="p-6 rounded border border-accent-orange/20 mb-5"
          style={{ background: 'rgba(14,22,40,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <FileSlot
              {...SLOTS[0]}
              file={file1}
              onFile={setFile1}
              onClear={() => { setFile1(null); setResult(null); setError(null); setUploadState('idle'); }}
              disabled={isLoading}
            />
            <FileSlot
              {...SLOTS[1]}
              file={file2}
              onFile={setFile2}
              onClear={() => { setFile2(null); setResult(null); setError(null); setUploadState('idle'); }}
              disabled={isLoading}
            />
          </div>

          {/* Status hint */}
          {!file1 && !file2 && (
            <p className="terminal-text text-[10px] text-text-secondary/30 tracking-widest text-center mb-4">
              BOTH SLOTS MUST BE FILLED TO RUN ANALYSIS
            </p>
          )}

          {/* Action row */}
          <div className="flex gap-3">
            <motion.button
              whileHover={canSubmit ? { scale: 1.01 } : {}}
              whileTap={canSubmit ? { scale: 0.99 } : {}}
              onClick={runDetection}
              disabled={!canSubmit}
              className="flex-1 py-3 rounded border transition-all"
              style={{
                borderColor: canSubmit ? 'rgba(255,184,0,0.55)' : 'rgba(255,184,0,0.15)',
                background: canSubmit ? 'rgba(255,184,0,0.08)' : 'rgba(255,184,0,0.02)',
                color: canSubmit ? 'rgba(255,184,0,0.9)' : 'rgba(255,184,0,0.3)',
                boxShadow: canSubmit ? '0 0 16px rgba(255,184,0,0.07)' : 'none',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="terminal-text text-xs tracking-widest">
                      {uploadState === 'uploading' ? 'UPLOADING…' : 'ANALYZING CHANGE…'}
                    </span>
                  </>
                ) : uploadState === 'done' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="terminal-text text-xs tracking-widest">RE-ANALYZE</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span className="terminal-text text-xs tracking-widest">
                      {!file1 || !file2 ? 'SELECT BOTH IMAGES FIRST' : 'RUN CHANGE DETECTION'}
                    </span>
                  </>
                )}
              </div>
            </motion.button>

            {(file1 || file2 || result) && !isLoading && (
              <button
                onClick={handleClear}
                className="px-4 py-3 rounded border border-text-secondary/15 text-text-secondary/40 hover:text-red-400 hover:border-red-500/30 transition-all terminal-text text-[10px] tracking-widest"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* ── Error banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 px-4 py-3 rounded border border-red-500/30 mb-5"
              style={{ background: 'rgba(255,46,99,0.07)' }}
            >
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="terminal-text text-[10px] text-red-400 tracking-widest uppercase mb-0.5">Detection Failed</p>
                <p className="terminal-text text-xs text-red-400/70">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result card ── */}
        <AnimatePresence>
          {result && uploadState === 'done' && (
            <ChangeDetectionResultCard result={result} />
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
