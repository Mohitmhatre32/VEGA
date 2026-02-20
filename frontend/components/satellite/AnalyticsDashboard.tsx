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
        <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-4 text-white">
          Performance Analytics
        </motion.h2>
        <motion.p variants={itemVariants} className="text-gray-400 mb-12">
          System accuracy and processing efficiency metrics
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Accuracy Trend */}
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Classification Accuracy</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a5c" />
                <XAxis dataKey="month" stroke="#a0aec0" />
                <YAxis stroke="#a0aec0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1f3a',
                    border: '1px solid #2d3a5c',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#00d9ff"
                  strokeWidth={3}
                  dot={{ fill: '#00d9ff', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Processing Speed */}
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Processing Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a5c" />
                <XAxis dataKey="month" stroke="#a0aec0" />
                <YAxis stroke="#a0aec0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1f3a',
                    border: '1px solid #2d3a5c',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `${value}ms`}
                />
                <Bar dataKey="processTime" fill="#00ff88" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Key Metrics Grid */}
        <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Avg Accuracy', value: '95.2%', color: 'from-cyan-500 to-blue-500' },
            { label: 'Avg Coverage', value: '89.5%', color: 'from-green-500 to-cyan-500' },
            { label: 'Avg Speed', value: '38ms', color: 'from-purple-500 to-pink-500' },
            { label: 'Total Processed', value: '14,827', color: 'from-orange-500 to-red-500' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-10 border border-white border-opacity-20`}
            >
              <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
