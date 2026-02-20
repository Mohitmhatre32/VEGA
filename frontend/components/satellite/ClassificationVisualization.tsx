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
        <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-4 text-text-primary">
          Classification Results
        </motion.h2>
        <motion.p variants={itemVariants} className="text-text-secondary mb-12">
          Real-time terrain breakdown with confidence scores
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart */}
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-2xl bg-bg-secondary/50 border border-accent-cyan/20 backdrop-blur-sm"
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
                  style={{ outline: 'none' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="rgba(11, 15, 26, 0.5)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${Number(value).toLocaleString()} km²`}
                  contentStyle={{
                    backgroundColor: '#0E1628', // bg-secondary
                    borderColor: 'rgba(0, 245, 255, 0.2)', // accent-cyan/20
                    color: '#E6F1FF', // text-primary
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: '#E6F1FF' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span style={{ color: '#94A3B8' }}>{value}</span>}
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
                className="p-4 rounded-lg bg-bg-secondary/30 border border-accent-cyan/10 hover:border-accent-cyan/50 transition-all hover:bg-bg-secondary/50 group"
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
                    <span className="font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">{result.terrainType}</span>
                  </div>
                  <span className="text-sm text-text-secondary">{result.area.toLocaleString()} km²</span>
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
