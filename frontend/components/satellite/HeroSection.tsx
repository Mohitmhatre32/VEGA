'use client';

import { motion } from 'framer-motion';
import { Satellite, ArrowRight } from 'lucide-react';
import { fadeIn, slideUp } from '@/lib/animations';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-6">
          <motion.div
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">AI-Powered Satellite Imagery Analysis</span>
          </motion.div>
        </motion.div>

        <motion.h1
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight"
        >
          Terrain Classification at Scale
        </motion.h1>

        <motion.p
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Advanced satellite imagery processing with real-time terrain classification, change detection, and comprehensive analytics
        </motion.p>

        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2 group">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 rounded-lg border border-gray-500 text-gray-300 font-semibold hover:bg-gray-500/10 transition-colors">
            View Demo
          </button>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-4 md:gap-8"
        >
          {[
            { value: '98%', label: 'Accuracy' },
            { value: '45ms', label: 'Avg Response' },
            { value: '1000+', label: 'Images/Day' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-white bg-opacity-5 border border-cyan-500/20"
            >
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
