'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, CheckCircle2, Loader2, Zap, X } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  step: number; // 0=uploading 1=processing 2=analyzing 3=done
}

const STEPS = [
  { label: 'UPLOADING', icon: Upload },
  { label: 'PROCESSING', icon: Loader2 },
  { label: 'ANALYZING', icon: Zap },
  { label: 'COMPLETE', icon: CheckCircle2 },
];

export function UploadPanel() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const processFile = (file: File) => {
    const entry: UploadedFile = { name: file.name, size: file.size, step: 0 };
    setUploads((prev) => [...prev, entry]);

    // Advance step every 900ms
    let s = 0;
    const t = setInterval(() => {
      s++;
      setUploads((prev) =>
        prev.map((u) => (u.name === file.name && u.step < 3 ? { ...u, step: s } : u))
      );
      if (s >= 3) clearInterval(t);
    }, 900);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(processFile);
    e.target.value = '';
  };

  const removeUpload = (name: string) =>
    setUploads((prev) => prev.filter((u) => u.name !== name));

  return (
    <section className="relative py-16 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-accent-blue/4 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-px bg-accent-cyan/60" />
          <span className="terminal-text text-xs tracking-widest text-accent-cyan/60 uppercase">
            Upload Protocol · Dataset Injection
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-accent-cyan/20 to-transparent" />
        </div>

        <h2 className="font-display text-2xl font-bold text-text-primary tracking-wider mb-2">
          UPLOAD & ANALYZE
        </h2>
        <p className="terminal-text text-xs text-text-secondary/50 tracking-wider mb-8">
          Submit satellite imagery for real-time terrain classification pipeline
        </p>

        {/* Drop zone */}
        <motion.div
          animate={{
            borderColor: isDragActive ? 'rgba(0,245,255,0.7)' : 'rgba(0,245,255,0.2)',
            background: isDragActive ? 'rgba(0,245,255,0.06)' : 'rgba(14,22,40,0.5)',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="relative p-10 rounded border-2 border-dashed cursor-pointer transition-shadow"
          style={{
            boxShadow: isDragActive ? '0 0 24px rgba(0,245,255,0.2), inset 0 0 24px rgba(0,245,255,0.04)' : 'none',
          }}
        >
          {/* Geo-grid behind */}
          {isDragActive && <div className="absolute inset-0 geo-grid rounded opacity-50" />}

          <div className="relative z-10 flex flex-col items-center gap-5 text-center">
            <motion.div
              animate={{ y: isDragActive ? -8 : 0, scale: isDragActive ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="p-4 rounded border border-accent-cyan/30 bg-accent-cyan/5"
            >
              <Upload className="w-7 h-7 text-accent-cyan" />
            </motion.div>

            <div>
              <p className="terminal-text text-sm text-text-primary tracking-wider mb-1">
                {isDragActive ? 'RELEASE TO INJECT DATASET' : 'DRAG FILES OR CLICK TO SELECT'}
              </p>
              <p className="terminal-text text-xs text-text-secondary/40 tracking-wide">
                GeoTIFF · PNG · JPEG · up to 500 MB per file
              </p>
            </div>

            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-accent-cyan/40" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-accent-cyan/40" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-accent-cyan/40" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-accent-cyan/40" />
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

        {/* Pipeline steps */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map(({ label, icon: Icon }, i) => (
            <div
              key={i}
              className="p-3 rounded border border-accent-cyan/10 flex items-center gap-3"
              style={{ background: 'rgba(14,22,40,0.6)' }}
            >
              <div className="p-1.5 rounded border border-accent-cyan/20 bg-accent-cyan/5">
                <Icon className="w-3.5 h-3.5 text-accent-cyan" />
              </div>
              <div>
                <p className="terminal-text text-[10px] text-text-secondary/40 tracking-widest">STEP {i + 1}</p>
                <p className="terminal-text text-xs text-text-secondary tracking-wider">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload queue */}
        <AnimatePresence>
          {uploads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-3"
            >
              <h3 className="terminal-text text-[10px] text-accent-cyan/50 tracking-widest uppercase mb-2">
                Processing Queue
              </h3>
              {uploads.map((u) => (
                <motion.div
                  key={u.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-4 rounded border border-accent-cyan/15"
                  style={{ background: 'rgba(14,22,40,0.7)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-accent-cyan/60" />
                      <span className="terminal-text text-xs text-text-secondary truncate max-w-[240px]">
                        {u.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="terminal-text text-[10px] text-accent-cyan tracking-widest">
                        {STEPS[u.step]?.label}
                      </span>
                      <button onClick={() => removeUpload(u.name)} className="text-text-secondary/40 hover:text-accent-red transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Step indicators */}
                  <div className="flex gap-2 mb-3">
                    {STEPS.map((step, i) => {
                      const StepIcon = step.icon;
                      const done = u.step > i;
                      const active = u.step === i;
                      return (
                        <div key={i} className="flex items-center gap-1">
                          <StepIcon
                            className={`w-3 h-3 ${done ? 'text-accent-green' : active ? 'text-accent-cyan animate-pulse' : 'text-text-secondary/20'}`}
                          />
                          {i < 3 && (
                            <div className={`w-6 h-px ${done ? 'bg-accent-green/60' : 'bg-text-secondary/15'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1 bg-bg-tertiary/40 rounded overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent-cyan to-accent-green"
                      style={{ boxShadow: '0 0 4px rgba(0,245,255,0.5)' }}
                      animate={{ width: `${(u.step / 3) * 100}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="flex justify-between mt-1">
                    <span className="terminal-text text-[10px] text-text-secondary/30">
                      {(u.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <span className="terminal-text text-[10px] text-accent-cyan/50">
                      {Math.round((u.step / 3) * 100)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
