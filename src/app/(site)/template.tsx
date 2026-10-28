"use client";

import { MotionConfig, motion } from "motion/react";

// Se vuelve a montar en cada navegación del sitio (inicio, servicios, cotizar…): la página nueva entra subiendo y aclarándose.
// La barra y el pie viven en el layout, así que no se mueven.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    </MotionConfig>
  );
}
