'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { classificationResults } from '@/lib/mockData';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { containerVariants, itemVariants } from '@/lib/animations';

export function ClassificationVisualization() {
  const chartData = classificationResults.map((r) => ({
    name: r.terrainType,
    value: r.area,
    color: r.color,
  }));

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
          Classification Results
        </motion.h2>
        <motion.p variants={itemVariants} className="text-gray-400 mb-12">
          Real-time terrain breakdown with confidence scores
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart */}
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toLocaleString()} km²`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${Number(value).toLocaleString()} km²`}
                  contentStyle={{
                    backgroundColor: '#1a1f3a',
                    border: '1px solid #2d3a5c',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Confidence Scores */}
          <motion.div variants={itemVariants} className="space-y-6">
            {classificationResults.map((result, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-4 rounded-lg bg-white bg-opacity-5 border border-gray-700/50 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: result.color,
                        boxShadow: `0 0 8px ${result.color}80`,
                      }}
                    />
                    <span className="font-semibold text-white">{result.terrainType}</span>
                  </div>
                  <span className="text-sm text-gray-400">{result.area.toLocaleString()} km²</span>
                </div>
                <ConfidenceBar
                  value={result.confidence}
                  color={result.color}
                  label="Confidence Score"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
