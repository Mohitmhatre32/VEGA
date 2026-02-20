'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/* ─── Mock data ──────────────────────────────────── */
const lossData = [
  { epoch: 1, loss: 2.41 }, { epoch: 5, loss: 1.82 },
  { epoch: 10, loss: 1.35 }, { epoch: 20, loss: 0.94 },
  { epoch: 40, loss: 0.67 }, { epoch: 60, loss: 0.48 },
  { epoch: 80, loss: 0.35 }, { epoch: 100, loss: 0.24 },
];

const confMatrix = [
  [94, 2, 1, 2, 1],
  [1, 91, 3, 3, 2],
  [2, 4, 88, 4, 2],
  [1, 2, 3, 93, 1],
  [2, 1, 2, 2, 93],
];
const labels = ['FOR', 'WAT', 'URB', 'AGR', 'BAR'];

/* ─── Radial Chart ───────────────────────────────── */
function RadialReliabilityChart({ target = 92.4 }: { target?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const t = setInterval(() => {
      v += 1.5;
      setValue(Math.min(v, target));
      if (v >= target) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [inView, target]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background track */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(0,245,255,0.08)" strokeWidth="12" />
          {/* Progress arc */}
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="url(#reliabilityGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.05s linear', filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.5))' }}
          />
          {/* Tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const r = (n: number) => Math.round(n * 1e6) / 1e6;
            const x1 = r(100 + 92 * Math.cos(angle));
            const y1 = r(100 + 92 * Math.sin(angle));
            const x2 = r(100 + 86 * Math.cos(angle));
            const y2 = r(100 + 86 * Math.sin(angle));
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,245,255,0.25)" strokeWidth="1" />;
          })}
          <defs>
            <linearGradient id="reliabilityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F5FF" />
              <stop offset="100%" stopColor="#00FF88" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="terminal-text text-3xl font-bold text-accent-cyan">{value.toFixed(1)}%</div>
          <div className="terminal-text text-[10px] text-text-secondary/50 tracking-widest mt-1">RELIABILITY</div>
        </div>
      </div>
      <div className="terminal-text text-xs text-text-secondary/50 tracking-widest mt-2">MODEL CONFIDENCE</div>
    </div>
  );
}

/* ─── Confusion Matrix ───────────────────────────── */
function ConfusionMatrix() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const maxVal = 100;

  return (
    <div ref={ref}>
      <h3 className="terminal-text text-[10px] tracking-widest text-accent-cyan/50 uppercase mb-3">
        Confusion Matrix
      </h3>
      <div className="flex gap-2">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-around pr-1">
          {labels.map((l) => (
            <div key={l} className="terminal-text text-[9px] text-text-secondary/50 tracking-wider">{l}</div>
          ))}
        </div>

        <div>
          {/* X-axis labels */}
          <div className="grid grid-cols-5 gap-0.5 mb-1">
            {labels.map((l) => (
              <div key={l} className="terminal-text text-[9px] text-text-secondary/50 text-center tracking-wider w-8">{l}</div>
            ))}
          </div>
          {/* Grid cells */}
          <div className="grid grid-cols-5 gap-0.5">
            {confMatrix.flatMap((row, ri) =>
              row.map((val, ci) => {
                const isDiag = ri === ci;
                const intensity = val / maxVal;
                return (
                  <motion.div
                    key={`${ri}-${ci}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: (ri * 5 + ci) * 0.02, duration: 0.3 }}
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{
                      background: isDiag
                        ? `rgba(0,245,255,${intensity * 0.5})`
                        : `rgba(255,46,99,${(1 - intensity) * 0.3})`,
                      border: isDiag
                        ? '1px solid rgba(0,245,255,0.3)'
                        : '1px solid rgba(255,46,99,0.15)',
                      boxShadow: isDiag
                        ? `0 0 6px rgba(0,245,255,${intensity * 0.4})`
                        : 'none',
                    }}
                  >
                    <span className="terminal-text text-[9px] font-bold" style={{
                      color: isDiag ? '#00F5FF' : 'rgba(255,46,99,0.8)',
                    }}>
                      {val}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────── */
export function AnalyticsDashboard() {
  return (
    <section className="relative py-16 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-blue/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-px bg-accent-blue/60" />
      
          <div className="flex-1 h-px bg-gradient-to-r from-accent-blue/20 to-transparent" />
        </div>

        <h2 className="font-display text-2xl font-bold text-text-primary tracking-wider mb-8">
          ORBITAL METRICS DASHBOARD
        </h2>

        {/* Top row: radial + line graph */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 mb-6">

          {/* Radial reliability */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded border border-accent-cyan/15 flex flex-col items-center justify-center"
            style={{ background: 'rgba(14,22,40,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <RadialReliabilityChart target={92.4} />

            {/* Mini stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 w-full">
              {[
                { label: 'PRECISION', value: '94.1%', color: 'text-accent-cyan' },
                { label: 'RECALL', value: '91.8%', color: 'text-accent-green' },
                { label: 'F1 SCORE', value: '92.9%', color: 'text-accent-blue' },
                { label: 'mAP', value: '89.3%', color: 'text-accent-orange' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-2 rounded border border-accent-cyan/8 bg-accent-cyan/2">
                  <div className="terminal-text text-[10px] text-text-secondary/40 tracking-widest">{label}</div>
                  <div className={`terminal-text text-sm font-bold ${color}`}>{value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Training loss line graph */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded border border-accent-cyan/15"
            style={{ background: 'rgba(14,22,40,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <h3 className="terminal-text text-[10px] tracking-widest text-accent-cyan/50 uppercase mb-4">
              Training Loss Curve
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,245,255,0.06)" />
                <XAxis
                  dataKey="epoch"
                  stroke="rgba(148,163,184,0.4)"
                  tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8' }}
                  label={{ value: 'EPOCH', position: 'insideBottom', offset: -2, fill: 'rgba(148,163,184,0.4)', fontFamily: 'JetBrains Mono', fontSize: 9 }}
                />
                <YAxis
                  stroke="rgba(148,163,184,0.4)"
                  tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8' }}
                  label={{ value: 'LOSS', angle: -90, position: 'insideLeft', fill: 'rgba(148,163,184,0.4)', fontFamily: 'JetBrains Mono', fontSize: 9 }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0E1628',
                    border: '1px solid rgba(0,245,255,0.3)',
                    borderRadius: '4px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    color: '#E6F1FF',
                  }}
                  formatter={(v) => [Number(v).toFixed(3), 'Loss']}
                />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#00F5FF"
                  strokeWidth={2}
                  dot={{ fill: '#00F5FF', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#00FF88' }}
                  strokeDasharray="0"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Bottom row: confusion matrix + key metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
          {/* Confusion matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded border border-accent-cyan/15"
            style={{ background: 'rgba(14,22,40,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <ConfusionMatrix />
          </motion.div>

          {/* System performance metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded border border-accent-cyan/15"
            style={{ background: 'rgba(14,22,40,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <h3 className="terminal-text text-[10px] tracking-widest text-accent-cyan/50 uppercase mb-4">
              System Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Avg Accuracy', value: '95.2%', color: 'text-accent-cyan' },
                { label: 'Avg Coverage', value: '89.5%', color: 'text-accent-blue' },
                { label: 'Avg Speed', value: '38ms', color: 'text-accent-green' },
                { label: 'Total Processed', value: '14,827', color: 'text-accent-orange' },
              ].map((m) => (
                <div key={m.label}
                  className="p-4 rounded border border-accent-cyan/10 bg-accent-cyan/3 hover:border-accent-cyan/25 transition-colors"
                >
                  <p className="terminal-text text-[10px] text-text-secondary/50 tracking-widest mb-2">{m.label}</p>
                  <p className={`terminal-text text-2xl font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Terrain per-class bars */}
           
          </motion.div>
        </div>
      </div>
    </section>
  );
}
