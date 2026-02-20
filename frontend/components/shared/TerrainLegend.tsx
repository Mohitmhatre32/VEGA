'use client';

import { motion } from 'framer-motion';
import { TERRAIN_TYPES, TERRAIN_COLORS } from '@/lib/constants';
import { containerVariants, itemVariants } from '@/lib/animations';

export function TerrainLegend() {
  const terrains = Object.entries(TERRAIN_TYPES).map(([key, value]) => ({
    key,
    name: value,
    color: TERRAIN_COLORS[value as keyof typeof TERRAIN_COLORS],
  }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-5 gap-4"
    >
      {terrains.map((terrain) => (
        <motion.div
          key={terrain.key}
          variants={itemVariants}
          className="flex items-center gap-2 p-3 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-colors"
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: terrain.color, boxShadow: `0 0 8px ${terrain.color}80` }}
          />
          <span className="text-sm text-gray-300">{terrain.name}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
