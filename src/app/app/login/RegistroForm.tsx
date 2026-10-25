"use client";

import { MotionConfig, motion } from "motion/react";
import { useActionState } from "react";
import { register, type LoginState } from "./actions";

const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } } };

export function RegistroForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(register, {});
  return (
    <MotionConfig reducedMotion="user">
      <motion.form action={action} className="space-y-4" initial="hidden" animate="show" transition={{ staggerChildren: 0.07 }}>
        <div className="absolute left-[-9999px]" aria-hidden>
          <label>Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
        <motion.div variants={item}>
          <label className="label" htmlFor="r-name">Nombre</label>
          <input id="r-name" name="name" className="input" autoComplete="name" required />
        </motion.div>
        <motion.div variants={item}>
          <label className="label" htmlFor="r-email">Correo</label>
          <input id="r-email" name="email" type="email" className="input" autoComplete="email" defaultValue={state.email} required />
        </motion.div>
        <motion.div variants={item}>
          <label className="label" htmlFor="r-phone">Teléfono / WhatsApp</label>
          <input id="r-phone" name="phone" type="tel" className="input" placeholder="+52 55 0000 0000" autoComplete="tel" required />
        </motion.div>
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="r-password">Contraseña</label>
            <input id="r-password" name="password" type="password" className="input" autoComplete="new-password" minLength={10} placeholder="Mín. 10 caracteres" required />
          </div>
          <div>
            <label className="label" htmlFor="r-confirm">Repítela</label>
            <input id="r-confirm" name="confirm" type="password" className="input" autoComplete="new-password" required />
          </div>
        </motion.div>
        {state.error && (
          <motion.p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700" initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }} transition={{ duration: 0.45 }}>
            {state.error}
          </motion.p>
        )}
        <motion.div variants={item}>
          <button className="btn w-full py-3" disabled={pending}>{pending ? "Creando…" : "Crear cuenta"}</button>
        </motion.div>
      </motion.form>
    </MotionConfig>
  );
}
