"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { logoutSite } from "@/app/app/login/actions";
import { ProfileModal } from "./ProfileModal";

type U = { name: string; email: string; phone: string | null; staff: boolean; roleLabel: string };
const ease = [0.22, 1, 0.36, 1] as const;

/** Ícono de persona fijo (no se puede cambiar) dentro de un círculo. */
function Avatar({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan-400 text-white ${className}`}>
      <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    </span>
  );
}

export function UserMenu({ user }: { user: U }) {
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
        <button onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label={`Menú de ${user.name}`} className="cursor-pointer rounded-full ring-2 ring-transparent transition duration-300 hover:scale-105 hover:ring-accent/40 aria-expanded:ring-accent">
          <Avatar />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div role="menu" initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.2, ease }} style={{ transformOrigin: "top right" }} className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_60px_-20px_rgba(11,126,168,0.45)]">
              <div className="flex items-center gap-3 px-3 pb-3 pt-2">
                <Avatar className="h-11 w-11" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink" title={user.name}>{user.name}</p>
                  <p className="truncate text-xs text-mute" title={user.email}>{user.email}</p>
                  <p className="text-xs font-semibold text-accent">{user.roleLabel}</p>
                </div>
              </div>
              <div className="border-t border-line pt-2">
                {user.staff && <Link role="menuitem" href="/app" onClick={() => setOpen(false)} className={item}>Mi panel</Link>}
                <button role="menuitem" onClick={() => { setOpen(false); setEditing(true); }} className={item}>Editar perfil</button>
                <form action={logoutSite}><button role="menuitem" className={`${item} hover:!text-red-600`}>Cerrar sesión</button></form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* En el body: la barra tiene backdrop-filter y haría que el modal se quedara encerrado en ella. */}
      {editing && createPortal(<ProfileModal user={user} onClose={() => setEditing(false)} />, document.body)}
    </MotionConfig>
  );
}
