"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/Logo";
import { BellLink } from "./BellLink";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { SideNav } from "./SideNav";
import { EASE as ease } from "@/lib/motion";


/** Panel en celular: barra superior fija y menú que se desliza desde la izquierda. */
export function MobileNav({ items, name, role, unread, logout }: { items: { href: string; label: string; badge?: number }[]; name: string; role: string; unread: number; logout: () => Promise<void> }) {
  const path = usePathname();
  // El menú recuerda en qué página se abrió: al cambiar de página se cierra solo, sin efectos extra.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === path;
  const setOpen = (v: boolean) => setOpenAt(v ? path : null);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenAt(null); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden"; // el fondo no se desplaza mientras el menú está abierto
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface/85 px-4 backdrop-blur-xl lg:hidden print:hidden">
        <Link href="/app" aria-label="Panel general"><Logo /></Link>
        <div className="flex items-center gap-1">
          <BellLink href="/app/avisos" count={unread} />
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full transition-colors active:bg-soft">
            <motion.span className="block h-0.5 w-5 rounded-full bg-ink" animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease }} />
            <motion.span className="block h-0.5 w-5 rounded-full bg-ink" animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }} transition={{ duration: 0.2 }} />
            <motion.span className="block h-0.5 w-5 rounded-full bg-ink" animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease }} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden print:hidden">
            <motion.button aria-label="Cerrar menú" className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.4, ease }} className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col overflow-y-auto border-r border-line bg-surface p-4 shadow-2xl">
              <div className="flex items-center justify-between px-2 pb-6 pt-1">
                <Logo />
                <button onClick={() => setOpen(false)} aria-label="Cerrar menú" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-mute active:bg-soft">✕</button>
              </div>
              <SideNav items={items} scope="mobile" onNavigate={() => setOpen(false)} />
              <div className="mt-auto border-t border-line pt-4">
                <p className="truncate px-2 text-sm font-semibold">{name}</p>
                <p className="px-2 pb-3 text-xs text-mute">{role}</p>
                <Link href="/" className="btn mb-2 w-full py-2.5">← Ir al sitio</Link>
                <form action={logout}><button className="btn-ghost w-full py-2.5">Cerrar sesión</button></form>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
