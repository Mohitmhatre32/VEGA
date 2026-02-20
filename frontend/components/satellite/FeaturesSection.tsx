'use client';

import { motion } from 'framer-motion';
import { MapPin, Zap, BarChart3, Settings } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Mapping',
    description: 'Analyze satellite imagery with pinpoint accuracy in milliseconds',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process thousands of images daily with our optimized AI pipeline',
    gradient: 'from-blue-500 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Get actionable insights with comprehensive metrics and reports',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Settings,
    title: 'Customizable',
    description: 'Configure classification models for your specific use case',
    gradient: 'from-pink-500 to-orange-500',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </motion.h2>
            <motion.p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need for advanced satellite imagery analysis and terrain classification
            </motion.p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.6) 0%, rgba(45, 58, 92, 0.3) 100%)',
                  }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { number: '500+', label: 'Active Users' },
            { number: '1M+', label: 'Images Processed' },
            { number: '99.9%', label: 'Uptime' },
            { number: '24/7', label: 'Support' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg border border-cyan-500/20"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 31, 58, 0.8) 0%, rgba(45, 58, 92, 0.5) 100%)',
              }}
            >
              <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-1">{stat.number}</div>
              <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
