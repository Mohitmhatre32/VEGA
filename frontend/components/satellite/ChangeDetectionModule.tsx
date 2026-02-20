'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { changeDetectionData } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/animations';

export function ChangeDetectionModule() {
  return (
    <section className="py-20 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-4 text-text-primary">
          Change Detection
        </motion.h2>
        <motion.p variants={itemVariants} className="text-text-secondary mb-12">
          Year-over-year terrain transformation analysis (2019-2023)
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="p-8 rounded-2xl bg-bg-secondary/50 border border-accent-cyan/20 backdrop-blur-sm"
        >
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={changeDetectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUrban" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAgri" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#51cf66" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#51cf66" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#228be6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#228be6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A233A" />
              <XAxis dataKey="year" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E1628',
                  border: '1px solid #00F5FF',
                  borderRadius: '12px',
                  color: '#E6F1FF',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                formatter={(value) => `${value.toLocaleString()} km²`}
                itemStyle={{ color: '#E6F1FF' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="urbanArea"
                stackId="1"
                stroke="#ff6b6b"
                fillOpacity={1}
                fill="url(#colorUrban)"
                name="Urban"
              />
              <Area
                type="monotone"
                dataKey="agricultureArea"
                stackId="1"
                stroke="#51cf66"
                fillOpacity={1}
                fill="url(#colorAgri)"
                name="Agriculture"
              />
              <Area
                type="monotone"
                dataKey="forestArea"
                stackId="1"
                stroke="#228be6"
                fillOpacity={1}
                fill="url(#colorForest)"
                name="Forest"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Trend indicators */}
        <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Urban Growth',
              change: '+1047 km²',
              percent: '+58.2%',
              color: '#ff6b6b',
            },
            {
              label: 'Agriculture Change',
              change: '+1034 km²',
              percent: '+24.6%',
              color: '#51cf66',
            },
            {
              label: 'Forest Loss',
              change: '-609 km²',
              percent: '-17.4%',
              color: '#228be6',
            },
            {
              label: 'Water Level',
              change: '+306 km²',
              percent: '+32.2%',
              color: '#00d9ff',
            },
          ].map((trend, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-bg-secondary/30 border border-accent-cyan/10 hover:border-accent-cyan/50 hover:bg-bg-secondary/50 transition-all font-sans"
            >
              <p className="text-xs text-text-secondary mb-2 uppercase tracking-wide">{trend.label}</p>
              <p className="text-2xl font-bold mb-1 font-display" style={{ color: trend.color }}>
                {trend.change}
              </p>
              <p className="text-xs text-text-secondary/70">{trend.percent} since 2019</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
