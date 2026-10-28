"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { updateProfile, type ProfileState } from "@/app/app/login/actions";
import { CONFIG } from "@/lib/config";
import { EASE as ease } from "@/lib/motion";

type U = { name: string; email: string; phone: string | null };

/**
 * Ventana de "Editar perfil". Se abre con animación y se cierra con animación (onClose se llama al terminar la salida).
 * Si hay cambios sin guardar, cerrar por cualquier vía (fondo, Esc, ✕, Cancelar) pregunta: guardar, descartar o seguir editando.
 */
export function ProfileModal({ user, onClose }: { user: U; onClose: () => void }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const [show, setShow] = useState(true);
  const [ask, setAsk] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const form = useRef<HTMLFormElement>(null);

  // Cambiar teléfono o contraseña pide la contraseña actual.
  const sensitive = phone.trim() !== (user.phone ?? "") || pw !== "";
  const dirty = !state.ok && (name.trim() !== user.name || sensitive || confirm !== "");

  const close = () => setShow(false);
  const tryClose = () => (dirty ? setAsk(true) : close());

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (ask) setAsk(false);
      else tryClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  });
  useEffect(() => {
    if (!state.ok) return;
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, [state.ok]);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {show && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.25 } }}
          transition={{ duration: 0.35 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) tryClose(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Editar perfil"
            initial={{ opacity: 0, y: 36, scale: 0.92, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(6px)", transition: { duration: 0.22 } }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-surface p-7 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Editar perfil</h2>
              <button onClick={tryClose} aria-label="Cerrar" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-mute transition hover:rotate-90 hover:bg-soft hover:text-accent">✕</button>
            </div>

            {state.ok ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-soft text-2xl text-accent">✓</div>
                <p className="mt-4 font-semibold">Perfil actualizado</p>
              </motion.div>
            ) : (
              <motion.form ref={form} action={action} className="space-y-4" initial="hidden" animate="show" transition={{ delayChildren: 0.12, staggerChildren: 0.06 }}>
                {[
                  <div key="email">
                    <label className="label" htmlFor="p-email">Correo <span className="font-normal text-mute">(no se puede cambiar)</span></label>
                    <input id="p-email" className="input cursor-not-allowed opacity-60" value={user.email} readOnly disabled />
                  </div>,
                  <div key="name">
                    <label className="label" htmlFor="p-name">Nombre</label>
                    <input id="p-name" name="name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                  </div>,
                  <div key="phone">
                    <label className="label" htmlFor="p-phone">Teléfono / WhatsApp</label>
                    <input id="p-phone" name="phone" type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={CONFIG.phoneExample} autoComplete="tel" />
                  </div>,
                  <div key="pw" className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="p-new">Contraseña nueva</label>
                      <input id="p-new" name="newPassword" type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" placeholder="Opcional" />
                    </div>
                    <div>
                      <label className="label" htmlFor="p-confirm">Repítela</label>
                      <input id="p-confirm" name="confirm" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
                    </div>
                  </div>,
                ].map((field) => (
                  <motion.div key={field.key} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } }}>{field}</motion.div>
                ))}

                <AnimatePresence initial={false}>
                  {sensitive && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                      <div className="rounded-xl bg-soft p-4">
                        <label className="label" htmlFor="p-current">Confirma con tu contraseña actual</label>
                        <input id="p-current" name="current" type="password" className="input" autoComplete="current-password" required />
                        <p className="mt-2 text-xs text-mute">Hace falta para cambiar el teléfono o la contraseña.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {state.error && (
                  <motion.p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700" initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }} transition={{ duration: 0.45 }}>{state.error}</motion.p>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={tryClose} className="btn-ghost flex-1 py-2.5">Cancelar</button>
                  <button className="btn flex-1 py-2.5" disabled={pending}>{pending ? "Guardando…" : "Guardar cambios"}</button>
                </div>
              </motion.form>
            )}

            {/* Aviso de cambios sin guardar */}
            <AnimatePresence>
              {ask && (
                <motion.div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-surface/80 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <motion.div role="alertdialog" aria-label="Cambios sin guardar" initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="w-full rounded-2xl border border-line bg-surface p-6 text-center shadow-xl">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl text-amber-800">!</div>
                    <h3 className="mt-3 text-lg font-semibold">Tienes cambios sin guardar</h3>
                    <p className="mt-1 text-sm text-mute">¿Quieres guardarlos antes de salir?</p>
                    <div className="mt-5 flex flex-col gap-2">
                      <button className="btn py-2.5" onClick={() => { setAsk(false); form.current?.requestSubmit(); }}>Guardar cambios</button>
                      <button className="btn-ghost py-2.5 !border-red-300 !text-red-600 hover:!bg-red-50" onClick={() => { setAsk(false); close(); }}>Descartar</button>
                      <button className="btn-ghost py-2.5" onClick={() => setAsk(false)}>Seguir editando</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
