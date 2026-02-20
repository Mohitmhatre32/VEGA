'use client';

import { motion } from 'framer-motion';

export function AnimatedLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-20 h-20">
        {/* Rotating outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400"
        />

        {/* Pulsing inner circle */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-blue-400 bg-cyan-400/10"
        />

        {/* Center dot */}
        <motion.div
          animate={{ scale: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-cyan-400"
        />
      </div>
    </div>
  );
}
