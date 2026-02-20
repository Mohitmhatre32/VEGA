'use client';

import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { changeDetectionData } from '@/lib/mockData';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TRENDS = [
  { label: 'Urban Growth', change: '+1047 km²', percent: '+58.2%', color: '#FF2E63', rising: true },
  { label: 'Agriculture Change', change: '+1034 km²', percent: '+24.6%', color: '#FFB800', rising: true },
  { label: 'Forest Loss', change: '-609 km²', percent: '-17.4%', color: '#00FF88', rising: false },
  { label: 'Water Level', change: '+306 km²', percent: '+32.2%', color: '#00F5FF', rising: true },
];

export function ChangeDetectionModule() {
  return (
    <section className="relative py-16 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent-orange/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
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
          Year-over-year terrain transformation analysis · 2019–2023
        </p>

        {/* Chart panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded border border-accent-cyan/15 mb-6"
          style={{ background: 'rgba(14,22,40,0.7)', backdropFilter: 'blur(8px)' }}
        >
          {/* Monitor header strip */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-red/70" />
              <div className="w-2 h-2 rounded-full bg-accent-orange/70" />
              <div className="w-2 h-2 rounded-full bg-accent-green/70" />
            </div>
            <span className="terminal-text text-[10px] text-text-secondary/30 tracking-widest">
              TEMPORAL · STACKED AREA · 2019–2023
            </span>
            <div className="pulse-dot" style={{ width: 6, height: 6 }} />
          </div>

          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={changeDetectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {[
                  { id: 'urban', color: '#FF2E63' },
                  { id: 'agri', color: '#FFB800' },
                  { id: 'forest', color: '#00FF88' },
                  { id: 'water', color: '#00F5FF' },
                  { id: 'barren', color: '#8B6914' },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={`clr-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,245,255,0.06)" />
              <XAxis
                dataKey="year"
                stroke="rgba(148,163,184,0.3)"
                tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8' }}
              />
              <YAxis
                stroke="rgba(148,163,184,0.3)"
                tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#94A3B8' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#0B0F1A',
                  border: '1px solid rgba(0,245,255,0.3)',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  color: '#E6F1FF',
                }}
                formatter={(v) => [`${Number(v).toLocaleString()} km²`]}
              />
              <Legend
                wrapperStyle={{ paddingTop: 16, fontFamily: 'JetBrains Mono', fontSize: 10 }}
                formatter={(value) => <span style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>{value.toUpperCase()}</span>}
              />
              <Area type="monotone" dataKey="urbanArea" stackId="1" stroke="#FF2E63" fill="url(#clr-urban)" name="Urban" />
              <Area type="monotone" dataKey="agricultureArea" stackId="1" stroke="#FFB800" fill="url(#clr-agri)" name="Agriculture" />
              <Area type="monotone" dataKey="forestArea" stackId="1" stroke="#00FF88" fill="url(#clr-forest)" name="Forest" />
              <Area type="monotone" dataKey="waterArea" stackId="1" stroke="#00F5FF" fill="url(#clr-water)" name="Water" />
              <Area type="monotone" dataKey="barrenArea" stackId="1" stroke="#8B6914" fill="url(#clr-barren)" name="Barren" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Trend indicator cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRENDS.map(({ label, change, percent, color, rising }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: `0 0 16px ${color}25` }}
              className="p-4 rounded border transition-all"
              style={{
                background: 'rgba(14,22,40,0.6)',
                borderColor: `${color}25`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="terminal-text text-[10px] text-text-secondary/50 tracking-widest uppercase">
                  {label}
                </span>
                {rising
                  ? <TrendingUp className="w-3.5 h-3.5" style={{ color }} />
                  : <TrendingDown className="w-3.5 h-3.5" style={{ color }} />}
              </div>
              <div className="terminal-text text-xl font-bold mb-0.5" style={{ color }}>
                {change}
              </div>
              <div className="terminal-text text-xs text-text-secondary/40">{percent} since 2019</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
