"use client";

import { MotionConfig, motion } from "motion/react";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <MotionConfig reducedMotion="user">
      <motion.form action={action} className="space-y-5" initial="hidden" animate="show" transition={{ delayChildren: 0.35, staggerChildren: 0.12 }}>
        <motion.div variants={item}>
          <label className="label" htmlFor="email">Correo</label>
          <input id="email" name="email" type="email" className="input" placeholder="nombre@conserca.com" autoComplete="username" defaultValue={state.email} required />
        </motion.div>
        <motion.div variants={item}>
          <label className="label" htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
        </motion.div>
        {state.error && (
          <motion.p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700" initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }} transition={{ duration: 0.45 }}>
            {state.error}
          </motion.p>
        )}
        <motion.div variants={item}>
          <button className="btn w-full py-3" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
        </motion.div>
      </motion.form>
    </MotionConfig>
  );
}
