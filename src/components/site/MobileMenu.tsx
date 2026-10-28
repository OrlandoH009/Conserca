"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { logoutSite } from "@/app/app/login/actions";
import { EASE as ease } from "@/lib/motion";
import { Logo } from "./Logo";
import { ProfileModal } from "./ProfileModal";
import { ThemeToggle } from "./ThemeToggle";

type U = { name: string; email: string; phone: string | null; staff: boolean; roleLabel: string };

/** Sitio en celular: en lugar de la barra superior, un botón de hamburguesa pequeño y flotante con el menú. */
export function MobileMenu({ user, unread }: { user: U | null; unread: number }) {
  const path = usePathname();
  // El menú recuerda en qué página se abrió: al cambiar de página se cierra solo.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const open = openAt === path;
  const setOpen = (v: boolean) => setOpenAt(v ? path : null);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenAt(null); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  const here = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const links: [string, string][] = [
    ["/", "Inicio"],
    ["/servicios", "Servicios"],
    ["/cotizar", "Solicitar cotización"],
    ...(user
      ? [user.staff ? ["/app", "Mi panel"] : ["/mis-proyectos", "Mis proyectos"], [user.staff ? "/app/avisos" : "/avisos", unread ? `Avisos (${unread})` : "Avisos"]]
      : [["/app/login", "Iniciar sesión"], ["/registro", "Crear cuenta"]]) as [string, string][],
  ];
  const row = "flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors active:bg-soft";

  return (
    <MotionConfig reducedMotion="user">
      <div className="sm:hidden print:hidden">
        <button onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} className="fixed right-3 top-3 z-[60] flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full border border-line bg-surface/85 shadow-lg backdrop-blur-xl transition active:scale-90">
          <motion.span className="block h-0.5 w-5 rounded-full bg-ink" animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease }} />
          <motion.span className="block h-0.5 w-5 rounded-full bg-ink" animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }} transition={{ duration: 0.2 }} />
          <motion.span className="block h-0.5 w-5 rounded-full bg-ink" animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease }} />
        </button>

        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-50">
              <motion.button aria-label="Cerrar menú" className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
              <motion.nav aria-label="Menú" initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.22, ease }} style={{ transformOrigin: "top right" }} className="absolute right-3 top-3 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-line bg-surface p-2 pt-3 shadow-[0_24px_60px_-20px_rgba(11,126,168,0.45)]">
                <div className="flex h-8 items-center px-3 pr-14"><Logo /></div>
                <ul className="mt-2">
                  {links.map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} aria-current={here(href) ? "page" : undefined} className={`${row} ${here(href) ? "bg-soft font-semibold text-accent" : "text-ink"}`}>{label}</Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between border-t border-line px-1 pt-2">
                  <span className="px-2 text-xs text-mute">Tema</span>
                  <ThemeToggle />
                </div>
                {user && (
                  <div className="mt-2 border-t border-line pt-2">
                    <p className="truncate px-3 text-sm font-semibold" title={user.name}>{user.name}</p>
                    <p className="truncate px-3 pb-1 text-xs text-mute">{user.roleLabel}</p>
                    <button onClick={() => { setOpen(false); setEditing(true); }} className={`${row} text-ink`}>Editar perfil</button>
                    <form action={logoutSite}><button className={`${row} text-red-600`}>Cerrar sesión</button></form>
                  </div>
                )}
              </motion.nav>
            </div>
          )}
        </AnimatePresence>
      </div>
      {user && editing && createPortal(<ProfileModal user={user} onClose={() => setEditing(false)} />, document.body)}
    </MotionConfig>
  );
}
