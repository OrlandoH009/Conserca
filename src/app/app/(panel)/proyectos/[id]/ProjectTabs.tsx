"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/site/LocaleProvider";
import { EASE as ease } from "@/lib/motion";


type Tab = { key: string; label: string; hint: string; group: string };

/** Pestañas del proyecto agrupadas (Diseño / Administración) con forma de botón; el fondo azul se desliza a la activa. Debajo, qué es la pestaña actual. */
export function ProjectTabs({ projectId, tabs, active }: { projectId: number; tabs: Tab[]; active: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = tabs.find((x) => x.key === active) ?? tabs[0];
  const groups = [...new Set(tabs.map((x) => x.group))].map((g) => [g, tabs.filter((x) => x.group === g)] as const);

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
            {tabs.map((tab, i) => (
              <div key={tab.key}>
              {tab.group !== tabs[i - 1]?.group && <p className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-mute ${i ? "mt-2 border-t border-line pt-3" : "pt-1"}`}>{t(tab.group)}</p>}
              <Link role="menuitem" href={`/app/proyectos/${projectId}?tab=${tab.key}`} scroll={false} replace onClick={() => setOpen(false)} aria-current={tab.key === active ? "page" : undefined} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors active:bg-soft ${tab.key === active ? "bg-soft font-semibold text-accent" : "text-ink"}`}>
                {t(tab.label)}
                {tab.key === active && <span aria-hidden>✓</span>}
              </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3 hidden flex-wrap items-center gap-x-4 gap-y-3 sm:flex">
        {groups.map(([g, list], gi) => (
          <motion.div key={g} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: gi * 0.08, ease }} className="flex items-center gap-2.5">
            {gi > 0 && <span aria-hidden className="mr-1.5 h-7 w-px bg-line" />}
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">{t(g)}</span>
            <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
              {list.map((tab) => (
                <div key={tab.key} className="relative">
                  {tab.key === active && <motion.span layoutId="project-tab-pill" className="absolute inset-0 rounded-full bg-accent-solid" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <Link href={`/app/proyectos/${projectId}?tab=${tab.key}`} scroll={false} replace title={t(tab.hint)} aria-current={tab.key === active ? "page" : undefined} className={`relative block whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${tab.key === active ? "font-semibold text-white" : "text-ink/75 hover:bg-soft hover:text-accent"}`}>
                    {t(tab.label)}
                  </Link>
                </div>
              ))}
            </div>
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
