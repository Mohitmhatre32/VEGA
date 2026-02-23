'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/* ─── Mock data ──────────────────────────────────── */
const lossData = [
  { epoch: 1, loss: 0.4339 },
  { epoch: 2, loss: 0.2293 },
  { epoch: 3, loss: 0.1776 },
  { epoch: 4, loss: 0.1587 },
  { epoch: 5, loss: 0.1411 },
  { epoch: 6, loss: 0.1280 },
  { epoch: 7, loss: 0.1182 },
  { epoch: 8, loss: 0.1144 },
  { epoch: 9, loss: 0.1019 },
  { epoch: 10, loss: 0.0993 },
];

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
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(0,245,255,0.08)"
            strokeWidth="12"
          />
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#reliabilityGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            style={{
              transition: 'stroke-dashoffset 0.05s linear',
              filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.5))',
            }}
          />
          <defs>
            <linearGradient id="reliabilityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F5FF" />
              <stop offset="100%" stopColor="#00FF88" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="terminal-text text-3xl font-bold text-accent-cyan">
            {value.toFixed(1)}%
          </div>
          <div className="terminal-text text-[10px] text-text-secondary/50 tracking-widest mt-1">
            RELIABILITY
          </div>
        </div>
      </div>

      <div className="terminal-text text-xs text-text-secondary/50 tracking-widest mt-2">
        MODEL CONFIDENCE
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────── */
export function AnalyticsDashboard() {
  return (
    <section className="relative py-16 px-4">
      <div className="relative z-10 max-w-7xl mx-auto">

        <h2 className="font-display text-2xl font-bold text-text-primary tracking-wider mb-8">
          ORBITAL METRICS DASHBOARD
        </h2>

        {/* ─── Top Row ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 mb-10">

          {/* Radial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded border border-accent-cyan/15 flex flex-col items-center justify-center"
            style={{ background: 'rgba(14,22,40,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <RadialReliabilityChart target={96.7} />
          </motion.div>

          {/* Line Graph */}
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

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,245,255,0.06)" />
                <XAxis dataKey="epoch" stroke="rgba(148,163,184,0.4)" />
                <YAxis stroke="rgba(148,163,184,0.4)" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#00F5FF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ─── System Performance (Full Width) ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded border border-accent-cyan/15 mb-10"
          style={{ background: 'rgba(14,22,40,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <h3 className="terminal-text text-[10px] tracking-widest text-accent-cyan/50 uppercase mb-4">
            System Performance
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Accuracy', value: '96.7%', color: 'text-accent-cyan' },
              { label: 'Avg Coverage', value: '100%', color: 'text-accent-blue' },
              { label: 'Avg Speed', value: '0.2ms', color: 'text-accent-green' },
              { label: 'Total Processed', value: '12,000', color: 'text-accent-orange' },
            ].map((m) => (
              <div
                key={m.label}
                className="p-4 rounded border border-accent-cyan/10 bg-accent-cyan/3"
              >
                <p className="terminal-text text-[10px] text-text-secondary/50 tracking-widest mb-2">
                  {m.label}
                </p>
                <p className={`terminal-text text-2xl font-bold ${m.color}`}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Images Section (Below System Performance) ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          <img
            src="/imgs/para1.jpeg"
            alt="Model performance chart 1"
            className="w-full h-[500px] object-contain"
          />
          <img
            src="/imgs/para2.jpeg"
            alt="Model performance chart 2"
            className="w-full h-[500px] object-contain"
          />
        </motion.div>

      </div>
    </section>
  );
}