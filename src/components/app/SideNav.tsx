"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/site/LocaleProvider";

export function SideNav({ items, onNavigate }: { items: { href: string; label: string; badge?: number }[]; onNavigate?: () => void }) {
  const path = usePathname();
  const t = useT();
  return (
    <MotionConfig reducedMotion="user">
      <nav className="flex flex-col gap-1">
        {items.map((it, n) => {
          const on = it.href === "/app" ? path === "/app" : path.startsWith(it.href);
          return (
            <motion.div key={it.href} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 + n * 0.06, ease: [0.22, 1, 0.36, 1] }}>
              <Link href={it.href} onClick={onNavigate} className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:translate-x-0.5 ${on ? "font-semibold text-ink" : "text-mute hover:bg-slate-50 hover:text-ink"}`}>
                {/* Fondo y barrita de la sección actual: aparecen con un fundido (con layoutId rebotaban desde abajo al cambiar de página con scroll). */}
                {on && <span className="absolute inset-0 animate-[pop_.3s_ease-out] rounded-lg bg-line/50 motion-reduce:animate-none" />}
                {on && <span className="absolute inset-y-2 left-0 w-1 animate-[pop_.3s_ease-out] rounded-full bg-mono motion-reduce:animate-none" />}
                <span className={`relative h-2 w-2 rounded-full transition-transform ${on ? "scale-125 bg-mono" : "bg-slate-300"}`} />
                <span className="relative">{t(it.label)}</span>
                {it.badge ? <span className="relative ml-auto rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"><span aria-hidden>{it.badge}</span><span className="sr-only"> {t("({n} nuevas)", { n: it.badge })}</span></span> : null}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </MotionConfig>
  );
}
