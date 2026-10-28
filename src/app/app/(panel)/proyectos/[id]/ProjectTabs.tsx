"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { EASE as ease } from "@/lib/motion";


/** Pestañas del proyecto: la línea azul se desliza de una a otra y cada pestaña entra escalonada. */
export function ProjectTabs({ projectId, tabs, active }: { projectId: number; tabs: { key: string; label: string }[]; active: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="mb-6 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line">
        {tabs.map((t, i) => (
          <motion.div key={t.key} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05, ease }} className="relative">
            <Link href={`/app/proyectos/${projectId}?tab=${t.key}`} scroll={false} className={`block whitespace-nowrap px-4 py-2.5 text-sm transition-colors ${t.key === active ? "font-semibold text-accent" : "text-mute hover:text-ink"}`}>
              {t.label}
            </Link>
            {t.key === active && <motion.span layoutId="project-tab-line" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          </motion.div>
        ))}
      </div>
    </MotionConfig>
  );
}

/** Contenido de una pestaña: como el padre le pone `key`, se vuelve a montar al cambiar de pestaña y entra con animación. */
export function TabPane({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
        {children}
      </motion.div>
    </MotionConfig>
  );
}
