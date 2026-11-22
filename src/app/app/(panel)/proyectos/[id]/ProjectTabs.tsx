"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/site/LocaleProvider";
import { EASE as ease } from "@/lib/motion";


/** Pestañas del proyecto: la línea azul se desliza de una a otra y cada pestaña entra escalonada. Debajo, qué es la pestaña actual. */
export function ProjectTabs({ projectId, tabs, active }: { projectId: number; tabs: { key: string; label: string; hint: string }[]; active: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = tabs.find((x) => x.key === active) ?? tabs[0];

  // El menú del celular se cierra con clic fuera o Esc.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <MotionConfig reducedMotion="user">
      {/* Celular: mini menú desplegable con la sección actual; al elegir otra, navega y se cierra. */}
      <div ref={box} className="relative mb-3 sm:hidden">
        <button type="button" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} className="input flex w-full cursor-pointer items-center justify-between gap-2 font-semibold">
          <span className="truncate">{t(current.label)}</span>
          <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 text-mute transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 8 5 5 5-5" /></svg>
        </button>
        {open && (
          <div role="menu" className="absolute inset-x-0 top-full z-20 mt-2 animate-[pop_.15s_ease-out] rounded-xl border border-line bg-surface p-1.5 shadow-[0_18px_40px_-16px_rgba(11,126,168,0.45)] motion-reduce:animate-none">
            {tabs.map((tab) => (
              <Link key={tab.key} role="menuitem" href={`/app/proyectos/${projectId}?tab=${tab.key}`} scroll={false} replace onClick={() => setOpen(false)} aria-current={tab.key === active ? "page" : undefined} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors active:bg-soft ${tab.key === active ? "bg-soft font-semibold text-accent" : "text-ink"}`}>
                {t(tab.label)}
                {tab.key === active && <span aria-hidden>✓</span>}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3 hidden gap-1 overflow-x-auto overflow-y-hidden border-b border-line sm:flex">
        {tabs.map((tab, i) => (
          <motion.div key={tab.key} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05, ease }} className="relative">
            <Link href={`/app/proyectos/${projectId}?tab=${tab.key}`} scroll={false} replace title={t(tab.hint)} className={`block whitespace-nowrap px-3 py-2.5 text-sm transition-colors sm:px-4 ${tab.key === active ? "font-semibold text-accent" : "text-mute hover:text-ink"}`}>
              {t(tab.label)}
            </Link>
            {tab.key === active && <motion.span layoutId="project-tab-line" className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          </motion.div>
        ))}
      </div>
      <p className="mb-6 text-sm text-mute">{t(current.hint)}</p>
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
