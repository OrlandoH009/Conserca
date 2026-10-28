"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** `scope` separa las animaciones compartidas cuando el menú existe dos veces (barra lateral y menú de celular). */
export function SideNav({ items, scope = "side", onNavigate }: { items: { href: string; label: string; badge?: number }[]; scope?: string; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <nav className="flex flex-col gap-1">
        {items.map((it, n) => {
          const on = it.href === "/app" ? path === "/app" : path.startsWith(it.href);
          return (
            <motion.div key={it.href} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 + n * 0.06, ease: [0.22, 1, 0.36, 1] }}>
              <Link href={it.href} onClick={onNavigate} className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:translate-x-0.5 ${on ? "font-semibold text-accent" : "text-mute hover:bg-slate-50 hover:text-ink"}`}>
                {/* Fondo y barrita que se deslizan hasta la sección donde estás. */}
                {on && <motion.span layoutId={`${scope}-active`} className="absolute inset-0 rounded-lg bg-soft" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                {on && <motion.span layoutId={`${scope}-bar`} className="absolute inset-y-2 left-0 w-1 rounded-full bg-accent" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                <span className={`relative h-2 w-2 rounded-full transition-transform ${on ? "scale-125 bg-accent" : "bg-slate-300"}`} />
                <span className="relative">{it.label}</span>
                {it.badge ? <span className="relative ml-auto rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"><span aria-hidden>{it.badge}</span><span className="sr-only"> ({it.badge} nuevas)</span></span> : null}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </MotionConfig>
  );
}
