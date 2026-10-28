"use client";

import { MotionConfig, motion } from "motion/react";
import { useActionState } from "react";
import { CONFIG } from "@/lib/config";
import { register, type LoginState } from "./actions";
import { PasswordInput } from "./PasswordInput";

const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } } };

export function RegistroForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(register, {});
  return (
    <MotionConfig reducedMotion="user">
      <motion.form action={action} className="space-y-3 md:space-y-4" initial="hidden" animate="show" transition={{ staggerChildren: 0.07 }}>
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
          <input id="r-phone" name="phone" type="tel" className="input" placeholder={CONFIG.phoneExample} autoComplete="tel" required />
        </motion.div>
        <motion.div variants={item} className="grid gap-3 md:grid-cols-2 md:gap-4">
          <div>
            <label className="label" htmlFor="r-password">Contraseña</label>
            <PasswordInput id="r-password" name="password" autoComplete="new-password" minLength={10} placeholder="Mín. 10 caracteres" required />
          </div>
          <div>
            <label className="label" htmlFor="r-confirm">Repítela</label>
            <PasswordInput id="r-confirm" name="confirm" autoComplete="new-password" required />
          </div>
        </motion.div>
        <motion.label variants={item} className="flex cursor-pointer items-start gap-2.5 text-xs text-mute md:text-sm">
          <input name="terms" type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" required />
          <span>Leí y acepto los <a href="/terminos" target="_blank" className="font-semibold text-accent hover:underline">Términos y condiciones</a> y el <a href="/privacidad" target="_blank" className="font-semibold text-accent hover:underline">Aviso de privacidad</a>.</span>
        </motion.label>
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
