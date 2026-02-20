'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FeaturesSection } from '@/components/satellite/FeaturesSection';

const EarthScene = lazy(() => import('@/components/satellite/EarthScene'));

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const router = useRouter();

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    setScrollProgress(Math.min(Math.max(progress, 0), 1));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const showNavbar = scrollProgress > 0.08;

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'hsl(220 25% 5%)' }}
    >
      {/* CSS starfield */}
      <div className="starfield" />

      {/* Fixed 3D Earth Scene */}
      <div className="fixed inset-0 z-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-accent-cyan animate-pulse" />
            </div>
          }
        >
          <EarthScene className="w-full h-full" scrollProgress={scrollProgress} />
        </Suspense>
      </div>

      {/* Orbital header — fades in after hero */}
      <motion.header
        initial={false}
        animate={{ opacity: showNavbar ? 1 : 0, y: showNavbar ? 0 : -20 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5"
        style={{ pointerEvents: showNavbar ? 'auto' : 'none', background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" style={{ boxShadow: '0 0 6px rgba(0,245,255,0.8)' }} />
          <span
            className="text-[11px] tracking-[0.35em] uppercase text-white/70"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Orbital Terrain Intelligence
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/dashboard')}
          className="text-[11px] tracking-[0.2em] uppercase px-5 py-2 border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan transition-all"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          Launch →
        </motion.button>
      </motion.header>

      {/* ── HERO SECTION ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        {/* Hero text */}
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
          >
            <p
              className="text-xs tracking-[0.4em] mb-6 uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'hsl(0 0% 45%)' }}
            >
              Orbital Systems v4.2
            </p>

            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[0.1em] uppercase mb-6 text-white"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 20px rgba(0,245,255,0.5), 0 0 40px rgba(0,245,255,0.2)',
              }}
            >
              Orbital Terrain<br />Intelligence
            </h1>

            <p
              className="text-base md:text-lg max-w-xl mx-auto mb-10"
              style={{ color: 'hsl(0 0% 55%)', fontFamily: 'Inter, sans-serif' }}
            >
              AI-powered satellite terrain classification and environmental forecasting
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/dashboard')}
              className="px-10 py-4 text-sm tracking-[0.25em] uppercase transition-all duration-500 border"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,245,255,1)';
                e.currentTarget.style.color = 'rgba(0,245,255,1)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0,245,255,0.2), inset 0 0 30px rgba(0,245,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Initiate Sector Scan →
            </motion.button>
          </motion.div>
        </div>

        {/* Text fade on scroll */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: 'hsl(220 25% 5%)',
            opacity: Math.min(Math.max((scrollProgress - 0.03) * 8, 0), 0.95),
          }}
        />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 z-[6]"
          style={{ background: 'linear-gradient(to top, hsl(220 25% 5%), transparent)' }}
        />

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[7] flex flex-col items-center gap-2"
        >
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,245,255,0.4))' }} />
          <span
            className="text-[9px] tracking-[0.4em] uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(0,245,255,0.4)' }}
          >
            Scroll
          </span>
        </motion.div>
      </section>

      {/* ── DEPTH SCROLL SPACER ── */}
      <div className="relative h-screen z-10" />

      {/* ── CONTENT OVER EARTH ── */}
      <div className="relative z-10">

        {/* Divider */}
        <div className="max-w-xs mx-auto h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.25), transparent)' }} />

        {/* Features grid — full orbital section */}
        <section className="py-8">
          <FeaturesSection />
        </section>

        <div className="max-w-xs mx-auto h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.15), transparent)' }} />

        {/* CTA section */}
        <section className="py-32 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p
              className="text-[10px] tracking-[0.4em] uppercase mb-4"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'hsl(0 0% 40%)' }}
            >
              Mission Ready
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold tracking-[0.1em] uppercase mb-8 text-white"
              style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(0,245,255,0.3)' }}
            >
              Begin Your Mission
            </h2>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/dashboard')}
              className="px-12 py-5 text-sm tracking-[0.3em] uppercase transition-all duration-500"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                border: '1px solid rgba(0,245,255,0.6)',
                color: '#00F5FF',
                background: 'rgba(0,245,255,0.06)',
                boxShadow: '0 0 30px rgba(0,245,255,0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,245,255,0.14)';
                e.currentTarget.style.boxShadow = '0 0 50px rgba(0,245,255,0.25), inset 0 0 30px rgba(0,245,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,245,255,0.06)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0,245,255,0.1)';
              }}
            >
              Launch Dashboard →
            </motion.button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer
          className="border-t py-8 px-6"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(11,15,26,0.8)', backdropFilter: 'blur(8px)' }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
              <span
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ fontFamily: 'Orbitron, sans-serif', color: 'hsl(0 0% 45%)' }}
              >
                Orbital Terrain Intelligence
              </span>
            </div>
            <p
              className="text-[10px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'hsl(0 0% 35%)' }}
            >
              CLASSIFIED // AUTHORIZED PERSONNEL ONLY
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
