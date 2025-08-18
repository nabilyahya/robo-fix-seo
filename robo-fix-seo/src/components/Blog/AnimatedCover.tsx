// src/components/Blog/AnimatedCover.tsx
"use client";
import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export default function AnimatedCover({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
