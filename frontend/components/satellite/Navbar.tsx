'use client';

import { motion } from 'framer-motion';
import { Satellite } from 'lucide-react';

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-accent-cyan/10"
      style={{ background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Left — System Name */}
      <div className="flex items-center gap-3">
        <div className="relative p-1.5 rounded border border-accent-cyan/30 bg-accent-cyan/5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded bg-gradient-to-tr from-accent-cyan/10 to-transparent"
          />
          <Satellite className="w-4 h-4 text-accent-cyan relative z-10" />
        </div>
        <div>
          <div className="terminal-text text-xs text-accent-cyan/50 tracking-widest">ISRO · ORBITAL SYSTEM</div>
          <div className="font-display text-sm font-bold tracking-widest text-text-primary leading-none">
            ORBITAL TERRAIN INTELLIGENCE
          </div>
        </div>
      </div>

      {/* Right — Status indicators */}
      <div className="flex items-center gap-6">
        {/* Signal bars */}
        <div className="hidden sm:flex items-end gap-1 h-4">
          {[3, 5, 7, 9].map((h, i) => (
            <div
              key={i}
              className={`signal-bar w-1 rounded-sm ${i < 3 ? 'bg-accent-cyan' : 'bg-accent-cyan/20'}`}
              style={{ height: `${h}px`, transformOrigin: 'bottom' }}
            />
          ))}
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-4 bg-text-secondary/20" />

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className="pulse-dot" />
          <span className="terminal-text text-xs text-accent-green tracking-widest">SYS:ACTIVE</span>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-text-secondary/20" />

        {/* Time */}
        <div className="terminal-text text-xs text-text-secondary/60 tracking-wider hidden md:block">
          UTC +05:30
        </div>
      </div>
    </motion.header>
  );
}
