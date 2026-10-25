"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SideNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <nav className="flex flex-col gap-1">
        {items.map((it, n) => {
          const on = it.href === "/app" ? path === "/app" : path.startsWith(it.href);
          return (
            <motion.div key={it.href} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 + n * 0.06, ease: [0.22, 1, 0.36, 1] }}>
              <Link href={it.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:translate-x-0.5 ${on ? "bg-soft font-semibold text-accent" : "text-mute hover:bg-slate-50 hover:text-ink"}`}>
                <span className={`h-2 w-2 rounded-full transition-transform ${on ? "scale-125 bg-accent" : "bg-slate-300"}`} />
                {it.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </MotionConfig>
  );
}
