'use client';

import { motion } from 'framer-motion';
import { batchResults } from '@/lib/mockData';
import { CheckCircle, AlertCircle, Loader, Activity } from 'lucide-react';

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle,
    iconColor: 'text-accent-green',
    borderColor: 'rgba(0,255,136,0.2)',
    badgeColor: 'rgba(0,255,136,0.1)',
    badgeText: 'text-accent-green',
    label: 'COMPLETED',
  },
  processing: {
    icon: Loader,
    iconColor: 'text-accent-cyan',
    borderColor: 'rgba(0,245,255,0.2)',
    badgeColor: 'rgba(0,245,255,0.1)',
    badgeText: 'text-accent-cyan',
    label: 'PROCESSING',
  },
  failed: {
    icon: AlertCircle,
    iconColor: 'text-accent-red',
    borderColor: 'rgba(255,46,99,0.25)',
    badgeColor: 'rgba(255,46,99,0.1)',
    badgeText: 'text-accent-red',
    label: 'FAILED',
  },
} as const;

export function BatchProcessingResults() {
  const completed = batchResults.filter((r) => r.status === 'completed').length;
  const processing = batchResults.filter((r) => r.status === 'processing').length;
  const failed = batchResults.filter((r) => r.status === 'failed').length;

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
          BATCH PROCESSING RESULTS
        </h2>
        <p className="terminal-text text-xs text-text-secondary/50 tracking-wider mb-8">
          Multi-image analysis and processing queue status
        </p>

        {/* Job list */}
        <div className="space-y-3 mb-8">
          {batchResults.map((result, idx) => {
            const cfg = STATUS_CONFIG[result.status];
            const Icon = cfg.icon;

            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ x: 4 }}
                className="p-5 rounded border transition-all"
                style={{
                  background: 'rgba(14,22,40,0.7)',
                  borderColor: cfg.borderColor,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Icon
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.iconColor} ${result.status === 'processing' ? 'animate-spin' : ''}`}
                    />
                    <div className="min-w-0">
                      <h3 className="terminal-text text-sm text-text-primary tracking-wider truncate mb-0.5">
                        {result.name}
                      </h3>
                      <p className="terminal-text text-[10px] text-text-secondary/40 tracking-widest">
                        {new Date(result.timestamp).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`terminal-text text-[10px] tracking-widest px-2 py-0.5 rounded border ${cfg.badgeText}`}
                      style={{ background: cfg.badgeColor, borderColor: cfg.borderColor }}
                    >
                      {cfg.label}
                    </span>
                    <span className="terminal-text text-xs font-bold text-accent-cyan">
                      {result.progress}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-bg-tertiary/50 rounded overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${result.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.08 }}
                    className="h-full rounded"
                    style={{
                      background: result.status === 'failed'
                        ? 'linear-gradient(90deg, #FF2E63, #FF6B6B)'
                        : 'linear-gradient(90deg, #00F5FF, #00FF88)',
                      boxShadow: result.status === 'failed'
                        ? '0 0 6px rgba(255,46,99,0.5)'
                        : '0 0 6px rgba(0,245,255,0.4)',
                    }}
                  />
                </div>

                {/* Terrain breakdown dots */}
                <div className="grid grid-cols-5 gap-2">
                  {result.terrainBreakdown.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="terminal-text text-[9px] text-text-secondary/40">{t.terrainType.slice(0, 3)}</span>
                      <span className="terminal-text text-[9px] font-bold" style={{ color: t.color }}>
                        {t.confidence.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Jobs', value: batchResults.length, color: 'text-text-primary', icon: Activity },
            { label: 'Completed', value: completed, color: 'text-accent-green', icon: CheckCircle },
            { label: 'Processing', value: processing, color: 'text-accent-cyan', icon: Loader },
            { label: 'Failed', value: failed, color: 'text-accent-red', icon: AlertCircle },
          ].map(({ label, value, color, icon: Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded border border-accent-cyan/10 hover:border-accent-cyan/25 transition-colors"
              style={{ background: 'rgba(14,22,40,0.6)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="terminal-text text-[10px] text-text-secondary/40 tracking-widest uppercase">{label}</span>
                <Icon className={`w-3.5 h-3.5 ${color} opacity-50`} />
              </div>
              <p className={`terminal-text text-3xl font-bold ${color}`}>{value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
