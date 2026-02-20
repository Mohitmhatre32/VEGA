'use client';

import { motion } from 'framer-motion';
import { Satellite, ArrowRight } from 'lucide-react';
import { fadeIn, slideUp } from '@/lib/animations';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.div variants={fadeIn} initial="hidden" animate="visible" className="mb-6">
          <motion.div
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 mb-4"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Satellite className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm text-accent-cyan">AI-Powered Satellite Imagery Analysis</span>
          </motion.div>
        </motion.div>

        <motion.h1
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-green bg-clip-text text-transparent leading-tight"
        >
          Terrain Classification at Scale
        </motion.h1>

        <motion.p
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-text-secondary mb-8 max-w-2xl mx-auto"
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
          <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-blue text-text-primary font-bold hover:shadow-lg hover:shadow-accent-cyan/50 transition-all flex items-center justify-center gap-2 group">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 rounded-lg border border-text-secondary/30 text-text-primary font-semibold hover:bg-text-primary/5 transition-colors">
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
              className="p-4 rounded-lg bg-bg-secondary/50 backdrop-blur-sm border border-accent-cyan/20 box-border"
            >
              <div className="text-2xl md:text-3xl font-bold text-accent-cyan">{stat.value}</div>
              <div className="text-sm text-text-secondary">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
