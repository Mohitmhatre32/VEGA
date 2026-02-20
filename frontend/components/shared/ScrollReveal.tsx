'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Variants } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  variants?: Variants;
  delay?: number;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function ScrollReveal({ children, variants = defaultVariants, delay = 0 }: ScrollRevealProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
