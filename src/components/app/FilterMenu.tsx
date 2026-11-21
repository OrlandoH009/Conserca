"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/site/LocaleProvider";

/** Botón que despliega la lista de filtros; al elegir uno navega y se cierra. Se cierra también con clic fuera o Esc. */
export function FilterMenu({ label, current, options }: { label: string; current: string; options: { key: string; label: string; href: string }[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const active = options.find((o) => o.key === current) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <div ref={box} className="relative shrink-0">
      <button type="button" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label={`${label}: ${t(active.label)}`} className="input relative flex h-full cursor-pointer items-center gap-1 whitespace-nowrap !px-2.5 text-sm font-medium">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-mute" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 5h18l-7 8v6l-4 2v-8Z" /></svg>
        {/* En celular solo el embudo (con punto si hay filtro activo); desde sm también el nombre. */}
        <span className="hidden sm:inline">{t(active.label)}</span>
        {active.key && <span aria-hidden className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent sm:hidden" />}
        <svg viewBox="0 0 20 20" className={`hidden h-3.5 w-3.5 text-mute transition-transform duration-200 sm:block ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 8 5 5 5-5" /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 mt-2 w-48 animate-[pop_.15s_ease-out] rounded-xl border border-line bg-surface p-1.5 shadow-[0_18px_40px_-16px_rgba(11,126,168,0.45)] motion-reduce:animate-none">
          {options.map((o) => (
            <Link key={o.key || "todas"} role="menuitem" href={o.href} onClick={() => setOpen(false)} aria-current={o.key === active.key ? "true" : undefined} className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-soft hover:text-accent ${o.key === active.key ? "font-semibold text-accent" : "text-ink"}`}>
              {t(o.label)}
              {o.key === active.key && <span aria-hidden>✓</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
