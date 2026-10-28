"use client";

import { motion } from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  /** Animate on page load instead of on scroll. Use for content visible without scrolling. */
  onLoad?: boolean;
  className?: string;
};

/** Fades and lifts content into view once as it scrolls onto the screen. */
export function Reveal({ children, delay = 0, onLoad = false, className }: RevealProps) {
  const target = { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      {...(onLoad ? { animate: target } : { whileInView: target, viewport: { once: true, margin: "0px 0px -10% 0px" } })}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
