"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "./LocaleProvider";

/** "Portal de proyectos" sin sesión: pregunta si quiere iniciar sesión o crear una cuenta. onClose se llama al terminar la salida. */
export function PortalModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [show, setShow] = useState(true);
  const close = () => setShow(false);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setShow(false); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  // En el body: la barra tiene backdrop-filter y encerraría al modal.
  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {show && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="portal-title"
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative w-full max-w-sm rounded-3xl border border-line bg-surface p-7 text-center shadow-2xl"
          >
            <button onClick={close} aria-label={t("Cerrar")} className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-mute transition hover:rotate-90 hover:bg-soft hover:text-accent">✕</button>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-soft text-accent">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            </div>
            <h2 id="portal-title" className="mt-4 text-xl font-semibold tracking-tight">{t("Portal de proyectos")}</h2>
            <p className="mt-2 text-sm text-mute">{t("Para ver tus proyectos necesitas iniciar sesión o crear una cuenta.")}</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/app/login" onClick={close} className="btn w-full">{t("Iniciar sesión")}</Link>
              <Link href="/registro" onClick={close} className="w-full rounded-full px-5 py-2.5 font-semibold text-accent ring-1 ring-accent/40 transition hover:bg-accent/10 hover:ring-accent">{t("Crear cuenta")}</Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
