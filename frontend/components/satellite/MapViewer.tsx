'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { containerVariants, itemVariants } from '@/lib/animations';
import { TerrainLegend } from '@/components/shared/TerrainLegend';
import { Loader } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
  loading: () => (
    <div className="w-full h-[500px] rounded-2xl bg-gray-900/30 border border-cyan-500/20 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
        <p className="text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export function MapViewer() {
  return (
    <section className="py-20 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-4 text-white">
          Global Map Viewer
        </motion.h2>
        <motion.p variants={itemVariants} className="text-gray-400 mb-8">
          Interactive terrain classification map with real-time overlays
        </motion.p>

        <motion.div variants={itemVariants} className="mb-8">
          <MapComponent />
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-white mb-4">Terrain Types</h3>
          <TerrainLegend />
        </motion.div>
      </motion.div>
    </section>
  );
}
