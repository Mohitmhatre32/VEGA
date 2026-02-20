import { Suspense, lazy, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import TerrainSection from "@/components/TerrainSection";
import ForecastSection from "@/components/ForecastSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import DeploySection from "@/components/DeploySection";

const EarthScene = lazy(() => import("@/components/EarthScene"));

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    setScrollProgress(Math.min(Math.max(progress, 0), 1));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Navbar visibility: show after scrolling past hero
  const showNavbar = scrollProgress > 0.08;

  return (
    <div className="relative bg-background min-h-screen">
      {/* Starfield background */}
      <div className="starfield" />

      {/* Fixed 3D Earth Scene - persists through entire page */}
      <div className="fixed inset-0 z-0">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            </div>
          }
        >
          <EarthScene className="w-full h-full" scrollProgress={scrollProgress} />
        </Suspense>
      </div>

      {/* Navbar - fades in after hero */}
      <motion.div
        initial={false}
        animate={{ opacity: showNavbar ? 1 : 0, y: showNavbar ? 0 : -20 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ pointerEvents: showNavbar ? "auto" : "none" }}
      >
        <Navbar />
      </motion.div>

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        {/* Hero text overlay */}
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
          >
            <p className="data-label mb-6 tracking-[0.4em]">Orbital Systems v4.2</p>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold tracking-[0.1em] uppercase mb-6 text-foreground glow-text-cyan">
              Orbital Terrain<br />Intelligence
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 font-body">
              AI-powered satellite terrain classification and environmental forecasting
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost-orbital"
            >
              Initiate Sector Scan →
            </motion.button>
          </motion.div>
        </div>

        {/* Hero text fade on scroll */}
        <motion.div
          className="absolute inset-0 bg-background z-[5] pointer-events-none"
          style={{ opacity: Math.min(Math.max((scrollProgress - 0.03) * 8, 0), 0.95) }}
        />

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[6]" />
      </section>

      {/* Scroll spacer for depth transition (100-200vh) */}
      <div className="relative h-screen z-10" />

      {/* Content sections - these scroll over the fixed Earth */}
      <div className="relative z-10">
        {/* Divider line */}
        <div className="max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* TERRAIN CLASSIFICATION */}
        <TerrainSection />

        <div className="max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* FORECAST ENGINE */}
        <ForecastSection />

        <div className="max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* ANALYTICS DASHBOARD */}
        <AnalyticsSection />

        <div className="max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* DEPLOY CTA */}
        <DeploySection />

        {/* Footer */}
        <footer className="border-t border-border/30 py-8 px-6 bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="font-heading text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Orbital Terrain Intelligence
              </span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">
              CLASSIFIED // AUTHORIZED PERSONNEL ONLY
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
