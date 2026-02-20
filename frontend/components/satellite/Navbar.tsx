'use client';

import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Satellite, Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  const navItems = [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Analysis', href: '#analysis' },
    { label: 'Results', href: '#results' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (href?.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'glass-strong border-b border-accent-cyan/20 py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 border border-accent-cyan/30 overflow-hidden shadow-lg shadow-accent-cyan/20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-accent-cyan/10 to-transparent"
              />
              <Satellite className="w-6 h-6 text-accent-cyan group-hover:text-white transition-colors relative z-10" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-100 to-accent-cyan bg-clip-text text-transparent tracking-tight leading-none">
                SatelliteAI
              </span>
            </div>
          </motion.div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, i) => (
              <motion.a
                key={i}
                href={item.href}
                onClick={handleNavClick}
                className="relative px-3 py-1 text-base font-medium text-text-secondary hover:text-white transition-colors group"
              >
                <span className="relative z-10">{item.label}</span>
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-accent-cyan w-0 group-hover:w-full transition-all duration-300 ease-out"
                />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 rounded-lg -z-10" />
              </motion.a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden sm:block">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0, 245, 255, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white text-sm font-bold overflow-hidden shadow-lg shadow-accent-cyan/30 border border-accent-cyan/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span className="relative z-10 flex items-center gap-2">
                Launch App
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </motion.button>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? "auto" : 0,
            opacity: isOpen ? 1 : 0,
            marginBottom: isOpen ? 16 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden"
        >
          <div className="mt-4 bg-gradient-to-b from-bg-secondary/95 to-bg-secondary/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 space-y-2 shadow-2xl">
            {navItems.map((item, i) => (
              <motion.a
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: isOpen ? 0 : -20, opacity: isOpen ? 1 : 0 }}
                transition={{ delay: i * 0.1 }}
                href={item.href}
                onClick={(e) => {
                  handleNavClick(e);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-text-primary/5 text-text-secondary hover:text-text-primary transition-all group border border-transparent hover:border-text-primary/5"
              >
                <span className="font-medium text-lg">{item.label}</span>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-accent-cyan" />
              </motion.a>
            ))}
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isOpen ? 0 : 10, opacity: isOpen ? 1 : 0 }}
              transition={{ delay: 0.3 }}
              className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-blue text-white font-bold text-lg shadow-lg shadow-accent-cyan/20"
            >
              Launch App
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
