"use client";

import { MotionConfig, motion } from "motion/react";

// Se vuelve a montar en cada navegación del panel: la página nueva entra subiendo y aclarándose.
export default function PanelTemplate({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    </MotionConfig>
  );
}
