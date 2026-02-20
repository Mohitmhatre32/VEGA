'use client';

import { motion } from 'framer-motion';

interface ConfidenceBarProps {
  value: number;
  color?: string;
  label?: string;
  animated?: boolean;
}

export function ConfidenceBar({
  value,
  color = '#00d9ff',
  label,
  animated = true,
}: ConfidenceBarProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs text-gray-400">{label}</span>}
      <div className="w-full h-2 bg-gray-700 bg-opacity-50 rounded-full overflow-hidden">
        <motion.div
          initial={animated ? { width: 0 } : { width: `${value}%` }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}80`,
          }}
        />
      </div>
      <span className="text-xs text-gray-300 text-right">{value.toFixed(1)}%</span>
    </div>
  );
}
