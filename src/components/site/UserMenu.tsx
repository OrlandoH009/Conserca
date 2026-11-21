"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { logoutSite } from "@/app/app/login/actions";
import { BellLink } from "@/components/app/BellLink";
import { LangToggle } from "./LangToggle";
import { useT } from "./LocaleProvider";
import { ProfileModal } from "./ProfileModal";
import { ThemeToggle } from "./ThemeToggle";
import { EASE as ease } from "@/lib/motion";

type U = { name: string; email: string; phone: string | null; staff: boolean; roleLabel: string };

/** Ícono de persona fijo (no se puede cambiar) dentro de un círculo. */
function Avatar({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-solid to-accent-solid-2 text-white ${className}`}>
      <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    </span>
  );
}

/** Menú del ícono de persona. Sin sesión ofrece iniciar sesión o crear cuenta, así la barra queda limpia. */
export function UserMenu({ user, unread }: { user: U | null; unread: number }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // El menú se cierra al hacer clic fuera o con Esc.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  const item = "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-soft hover:text-accent";

  return (
    <MotionConfig reducedMotion="user">
      <div ref={box} className="relative">
        <button onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label={!user ? t("Menú de cuenta") : unread ? `${t("Menú de {name}", { name: user.name })} · ${t("Avisos: {n} sin leer", { n: unread })}` : t("Menú de {name}", { name: user.name })} className="relative cursor-pointer rounded-full ring-2 ring-transparent transition duration-300 hover:scale-105 hover:ring-accent/40 aria-expanded:ring-accent">
          <Avatar />
          {/* Los avisos viven dentro del menú: el punto rojo avisa que hay algo sin leer. */}
          {unread > 0 && <span aria-hidden className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-600 ring-2 ring-surface" />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div role="menu" initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.2, ease }} style={{ transformOrigin: "top right" }} className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-line bg-surface p-2 shadow-[0_24px_60px_-20px_rgba(11,126,168,0.45)]">
              <AccountHead user={user} unread={unread} onNavigate={() => setOpen(false)} />
              {user && (
                <div className="border-t border-line pt-2">
                    {user.staff && <Link role="menuitem" href="/app" onClick={() => setOpen(false)} className={item}>{t("Mi panel")}</Link>}
                    <button role="menuitem" onClick={() => { setOpen(false); setEditing(true); }} className={item}>{t("Editar perfil")}</button>
                    <form action={logoutSite}><button role="menuitem" className={`${item} hover:!text-red-600 dark:hover:!text-red-400`}>{t("Cerrar sesión")}</button></form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* En el body: la barra tiene backdrop-filter y haría que el modal se quedara encerrado en ella. */}
      {user && editing && createPortal(<ProfileModal user={user} onClose={() => setEditing(false)} />, document.body)}
    </MotionConfig>
  );
}

/** Campana bloqueada (sin sesión). El letrero sale al pasar el cursor, tocarla o enfocarla, y se va solo a los 3.5 s para no tapar el menú. */
function LockedBell() {
  const t = useT();
  const [tip, setTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = () => {
    setTip(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTip(false), 3500);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const msg = t("Necesitas iniciar sesión para acceder a este apartado");
  return (
    <span tabIndex={0} role="button" aria-disabled="true" aria-label={msg} onMouseEnter={show} onClick={show} onFocus={show} onMouseLeave={() => setTip(false)} className="relative flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-mute/50 outline-none">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 20a2 2 0 0 1-3.4 0" /></svg>
      <svg viewBox="0 0 24 24" className="absolute bottom-1 right-1 h-3 w-3 text-mute" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
      <span role="tooltip" aria-hidden={!tip} className={`pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-center text-xs font-medium text-surface shadow-lg transition-opacity duration-300 ${tip ? "opacity-100" : "opacity-0"}`}>{msg}</span>
    </span>
  );
}

/** Cabecera de la cuenta + fila de íconos (avisos, idioma, tema). La comparten el menú del perfil (PC) y el menú del celular. */
export function AccountHead({ user, unread, onNavigate }: { user: U | null; unread: number; onNavigate: () => void }) {
  const t = useT();
  // En celular los íconos llevan borde y fondo para que se note que se tocan; en PC quedan limpios.
  const tap = "bg-soft/60 ring-1 ring-line lg:bg-transparent lg:ring-0";
  return (
    <>
    {user ? (
      <div className="flex items-center gap-3 px-3 pb-3 pt-2">
        <Avatar className="h-11 w-11" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink" title={user.name}>{user.name}</p>
          <p className="truncate text-xs text-mute" title={user.email}>{user.email}</p>
          <p className="text-xs font-semibold text-accent">{user.roleLabel}</p>
        </div>
      </div>
    ) : (
      // Toda la fila (ícono + textos) es un solo enlace al login, donde puede cambiar a "Crear cuenta"; hover suave.
      // Celular: tarjeta azul con degradado y flecha, para que destaque. PC (lg): fila limpia con hover suave.
      <Link role="menuitem" href="/app/login" onClick={() => onNavigate()} className="group relative mb-2 flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-accent-solid to-accent-solid-2 px-3 py-3 text-white shadow-[0_10px_24px_-10px_rgba(11,126,168,0.8)] transition duration-200 active:scale-[.98] lg:rounded-xl lg:bg-none lg:py-2.5 lg:text-inherit lg:shadow-none lg:hover:bg-soft lg:active:scale-100">
        <span aria-hidden className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 lg:hidden" />
        <Avatar className="h-11 w-11 ring-2 ring-white/60 lg:ring-0" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold lg:text-ink lg:transition-colors lg:duration-200 lg:group-hover:text-accent">{t("Iniciar sesión")}</span>
          <span className="block text-xs text-white/80 lg:text-mute">{t("o Crear cuenta")}</span>
        </span>
        <svg viewBox="0 0 20 20" className="relative h-5 w-5 shrink-0 lg:hidden" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h12M11 5l5 5-5 5" /></svg>
      </Link>
    )}
    {/* Avisos (con sesión), idioma y tema como íconos. */}
    <div className="flex items-center justify-around border-t border-line py-1.5">
      {user ? <span onClick={() => onNavigate()}><BellLink href={user.staff ? "/app/avisos" : "/avisos"} count={unread} className={tap} /></span> : (
        <LockedBell />
      )}
      <LangToggle className={tap} />
      <ThemeToggle className={tap} />
    </div>
    </>
  );
}