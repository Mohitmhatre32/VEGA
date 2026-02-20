'use client';

import { motion } from 'framer-motion';
import { batchResults } from '@/lib/mockData';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/animations';

export function BatchProcessingResults() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-cyan-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'processing':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30';
      case 'failed':
        return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  return (
    <section className="py-20 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-4 text-text-primary">
          Batch Processing Results
        </motion.h2>
        <motion.p variants={itemVariants} className="text-text-secondary mb-8">
          Multi-image analysis and processing queue
        </motion.p>

        <motion.div variants={containerVariants} className="space-y-4">
          {batchResults.map((result) => (
            <motion.div
              key={result.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl bg-gradient-to-br ${getStatusColor(
                result.status
              )} border transition-all backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getStatusIcon(result.status)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary mb-1">{result.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-bg-tertiary/50 text-text-primary border border-white/5">
                  {result.progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-bg-tertiary/50 rounded-full overflow-hidden mb-4 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${result.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-blue"
                />
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-4 gap-2">
                {result.terrainBreakdown.slice(0, 4).map((terrain, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="w-3 h-3 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: terrain.color }}
                    />
                    <p className="text-xs text-text-secondary">{terrain.terrainType}</p>
                    <p className="text-xs font-semibold text-text-secondary/80">{terrain.confidence.toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Summary stats */}
        <motion.div variants={itemVariants} className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Jobs', value: batchResults.length, color: 'text-text-primary' },
            { label: 'Completed', value: batchResults.filter((r) => r.status === 'completed').length, color: 'text-accent-green' },
            { label: 'Processing', value: batchResults.filter((r) => r.status === 'processing').length, color: 'text-accent-cyan' },
            { label: 'Failed', value: batchResults.filter((r) => r.status === 'failed').length, color: 'text-accent-red' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-lg bg-bg-secondary/30 border border-accent-cyan/10 hover:border-accent-cyan/30 transition-all">
              <p className="text-xs text-text-secondary mb-1 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
