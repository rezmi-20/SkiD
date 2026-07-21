"use client";

import * as React from 'react';
import { motion } from 'framer-motion';

interface FadeContentProps {
  children: React.ReactNode;
  blur?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function FadeContent({
  children,
  blur = false,
  duration = 0.5,
  delay = 0,
  className = '',
}: FadeContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: blur ? 'blur(8px)' : 'blur(0px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
