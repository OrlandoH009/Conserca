"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { logoutSite } from "@/app/app/login/actions";
import { EASE as ease } from "@/lib/motion";
import { Logo } from "./Logo";
import { useT } from "./LocaleProvider";
import { PortalModal } from "./PortalModal";
import { ProfileModal } from "./ProfileModal";
import { AccountHead } from "./UserMenu";

type U = { name: string; email: string; phone: string | null; staff: boolean; roleLabel: string };

/** Sitio en celular: barra fija arriba con el logo y el botón de menú (no tapa el contenido al bajar). */
export function MobileMenu({ user, unread }: { user: U | null; unread: number }) {
  const path = usePathname();
  const t = useT();
  // El menú recuerda en qué página se abrió: al cambiar de página se cierra solo.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [portal, setPortal] = useState(false);
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
    user?.staff ? ["/app/proyectos", "Panel de proyectos"] : ["/cotizar", "Solicitar cotización"],
    ...(user && !user.staff ? [["/mis-proyectos", "Mis proyectos"]] : []) as [string, string][], // el equipo: un solo acceso al panel
  ];
  const row = "flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors active:bg-soft";

  return (
    <MotionConfig reducedMotion="user">
      <div className="lg:hidden print:hidden">
        <header className="fixed inset-x-0 top-0 z-[60] flex h-14 items-center justify-between border-b border-black/5 bg-surface/80 pl-4 pr-3 backdrop-blur-xl backdrop-saturate-150">
        <Link href="/" aria-label={t("Conserca, inicio")} onClick={() => setOpen(false)}><Logo className="h-9" /></Link>
        <button onClick={() => setOpen(!open)} aria-label={open ? t("Cerrar menú") : unread ? `${t("Abrir menú")} · ${t("Avisos: {n} sin leer", { n: unread })}` : t("Abrir menú")} aria-expanded={open} className="relative flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full border border-line bg-surface transition active:scale-90">
          <motion.span className="block h-0.5 w-5 rounded-full bg-ink" animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease }} />
          <motion.span className="block h-0.5 w-5 rounded-full bg-ink" animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }} transition={{ duration: 0.2 }} />
          <motion.span className="block h-0.5 w-5 rounded-full bg-ink" animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease }} />
          {/* Los avisos están dentro del menú: el punto rojo avisa que hay algo sin leer. */}
          {unread > 0 && !open && <span aria-hidden className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-600 ring-2 ring-surface" />}
        </button>
        </header>

        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-50">
              <motion.button aria-label={t("Cerrar menú")} className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
              <motion.nav aria-label={t("Menú")} initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.22, ease }} style={{ transformOrigin: "top right" }} className="absolute right-3 top-[4.25rem] w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-line bg-surface p-2 shadow-[0_24px_60px_-20px_rgba(11,126,168,0.45)]">
                {/* Igual que en PC: cuenta (o iniciar sesión) e íconos de avisos, idioma y tema. */}
                <div><AccountHead user={user} unread={unread} onNavigate={() => setOpen(false)} /></div>
                <ul className="border-t border-line pt-2">
                  {links.map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} aria-current={here(href) ? "page" : undefined} className={`${row} ${here(href) ? "bg-soft font-semibold text-accent" : "text-ink"}`}>{t(label)}</Link>
                    </li>
                  ))}
                  {!user && <li><button onClick={() => { setOpen(false); setPortal(true); }} aria-haspopup="dialog" className={`${row} text-ink`}>{t("Portal de proyectos")}</button></li>}
                </ul>
                {user && (
                  <div className="mt-2 border-t border-line pt-2">
                    <button onClick={() => { setOpen(false); setEditing(true); }} className={`${row} text-ink`}>{t("Editar perfil")}</button>
                    <form action={logoutSite}><button className={`${row} text-red-600`}>{t("Cerrar sesión")}</button></form>
                  </div>
                )}
              </motion.nav>
            </div>
          )}
        </AnimatePresence>
      </div>
      {portal && <PortalModal onClose={() => setPortal(false)} />}
      {user && editing && createPortal(<ProfileModal user={user} onClose={() => setEditing(false)} />, document.body)}
    </MotionConfig>
  );
}
