'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsData } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/animations';

export function AnalyticsDashboard() {
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
          Performance Analytics
        </motion.h2>
        <motion.p variants={itemVariants} className="text-text-secondary mb-12">
          System accuracy and processing efficiency metrics
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Accuracy Trend */}
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-2xl bg-bg-secondary/50 border border-accent-cyan/20 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">Classification Accuracy</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A233A" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1628',
                    border: '1px solid #00F5FF',
                    borderRadius: '12px',
                    color: '#E6F1FF',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: '#E6F1FF' }}
                  formatter={(value) => `${value}%`}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#00F5FF"
                  strokeWidth={3}
                  dot={{ fill: '#00F5FF', r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: '#E6F1FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Processing Speed */}
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-2xl bg-bg-secondary/50 border border-accent-cyan/20 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">Processing Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A233A" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1628',
                    border: '1px solid #00F5FF',
                    borderRadius: '12px',
                    color: '#E6F1FF',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: '#E6F1FF' }}
                  formatter={(value) => `${value}ms`}
                />
                <Bar dataKey="processTime" fill="#00FF88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Key Metrics Grid */}
        <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Accuracy', value: '95.2%', color: 'text-accent-cyan' },
            { label: 'Avg Coverage', value: '89.5%', color: 'text-accent-blue' },
            { label: 'Avg Speed', value: '38ms', color: 'text-accent-green' },
            { label: 'Total Processed', value: '14,827', color: 'text-accent-orange' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-bg-secondary/30 border border-accent-cyan/10 hover:border-accent-cyan/30 hover:bg-bg-secondary/50 transition-all font-sans"
            >
              <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider">{metric.label}</p>
              <p className={`text-3xl font-bold font-display ${metric.color}`}>{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
