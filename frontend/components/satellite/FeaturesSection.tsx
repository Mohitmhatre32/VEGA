'use client';

import { motion } from 'framer-motion';
import { MapPin, Zap, BarChart3, Settings, Satellite, Shield, Globe, Cpu } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Mapping',
    description: 'Analyze satellite imagery with pinpoint accuracy in milliseconds.',
    color: '#00F5FF',
    borderColor: 'rgba(0,245,255,0.2)',
    tag: 'CORE',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process thousands of images daily with our optimized AI pipeline.',
    color: '#FFB800',
    borderColor: 'rgba(255,184,0,0.2)',
    tag: 'PERFORMANCE',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Get actionable insights with comprehensive metrics and reports.',
    color: '#00FF88',
    borderColor: 'rgba(0,255,136,0.2)',
    tag: 'ANALYTICS',
  },
  {
    icon: Settings,
    title: 'Customizable',
    description: 'Configure classification models for your specific use case.',
    color: '#FF2E63',
    borderColor: 'rgba(255,46,99,0.2)',
    tag: 'CONFIG',
  },
  {
    icon: Satellite,
    title: 'Multi-Spectral',
    description: 'Support for multi-spectral and hyperspectral satellite bands.',
    color: '#9B59B6',
    borderColor: 'rgba(155,89,182,0.2)',
    tag: 'SENSOR',
  },
  {
    icon: Shield,
    title: 'Secure Pipeline',
    description: 'End-to-end encrypted data transfer and processing environment.',
    color: '#00BCD4',
    borderColor: 'rgba(0,188,212,0.2)',
    tag: 'SECURITY',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Operate across any geographic region without configuration changes.',
    color: '#E67E22',
    borderColor: 'rgba(230,126,34,0.2)',
    tag: 'COVERAGE',
  },
  {
    icon: Cpu,
    title: 'Edge Processing',
    description: 'Deploy classification models at the edge for offline operation.',
    color: '#2ECC71',
    borderColor: 'rgba(46,204,113,0.2)',
    tag: 'EDGE',
  },
];

const STATS = [
  { number: '500+', label: 'Active Users', color: 'text-accent-cyan' },
  { number: '1M+', label: 'Images Processed', color: 'text-accent-green' },
  { number: '99.9%', label: 'System Uptime', color: 'text-accent-blue' },
  { number: '24/7', label: 'Mission Support', color: 'text-accent-orange' },
];

export function FeaturesSection() {
  return (
    <section className="relative py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-cyan/4 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-blue/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-px bg-accent-blue/60" />
          <span className="terminal-text text-xs tracking-widest text-accent-blue/60 uppercase">
            System Capabilities · Feature Matrix
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-accent-blue/20 to-transparent" />
        </div>

        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary tracking-wider mb-3">
            SYSTEM CAPABILITIES
          </h2>
          <p className="terminal-text text-xs text-text-secondary/50 tracking-wider max-w-xl mx-auto">
            Everything you need for advanced satellite imagery analysis and terrain classification
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6, boxShadow: `0 8px 24px ${feature.color}20` }}
                className="group p-5 rounded border transition-all"
                style={{
                  background: 'rgba(14,22,40,0.6)',
                  borderColor: feature.borderColor,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="terminal-text text-[9px] tracking-widest px-1.5 py-0.5 rounded"
                    style={{ color: feature.color, background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                  >
                    {feature.tag}
                  </span>
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="p-2 rounded"
                    style={{ background: `${feature.color}10`, border: `1px solid ${feature.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: feature.color }} />
                  </motion.div>
                </div>

                <h3 className="font-display text-sm font-semibold text-text-primary mb-2 tracking-wide">
                  {feature.title}
                </h3>
                <p className="terminal-text text-xs text-text-secondary/60 leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom accent */}
                <div
                  className="mt-4 h-px w-0 group-hover:w-full transition-all duration-500 rounded"
                  style={{ background: `linear-gradient(90deg, ${feature.color}80, transparent)` }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ number, label, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.04 }}
              className="p-5 rounded border border-accent-cyan/10 hover:border-accent-cyan/25 transition-all text-center"
              style={{ background: 'rgba(14,22,40,0.6)', backdropFilter: 'blur(8px)' }}
            >
              <div className={`terminal-text text-3xl font-bold mb-1 ${color}`}>{number}</div>
              <div className="terminal-text text-[10px] text-text-secondary/50 tracking-widest uppercase">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
