"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useActionState } from "react";
import { useT } from "@/components/site/LocaleProvider";
import { login, type LoginState } from "./actions";
import { PasswordInput } from "./PasswordInput";
import { ResendVerification } from "./ResendVerification";

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };

export function LoginForm() {
  const t = useT();
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <MotionConfig reducedMotion="user">
      <motion.form action={action} className="space-y-4 md:space-y-5" initial="hidden" animate="show" transition={{ delayChildren: 0.1, staggerChildren: 0.1 }}>
        <motion.div variants={item}>
          <label className="label" htmlFor="email">{t("Correo")}</label>
          <input id="email" name="email" type="email" className="input" placeholder="nombre@conserca.com" autoComplete="username" defaultValue={state.email} required />
        </motion.div>
        <motion.div variants={item}>
          <label className="label" htmlFor="password">{t("Contraseña")}</label>
          <PasswordInput id="password" name="password" autoComplete="current-password" required />
          {/* Celular: con fondo y borde para que se note que se puede tocar; en PC queda como enlace. */}
          <div className="mt-2 flex justify-end">
            <Link href="/app/login/restablecer" className="rounded-full bg-soft px-3 py-1.5 text-sm font-semibold text-accent ring-1 ring-line active:scale-95 lg:bg-transparent lg:px-0 lg:py-0 lg:ring-0 lg:hover:underline">{t("¿Olvidaste tu contraseña?")}</Link>
          </div>
        </motion.div>
        <motion.label variants={item} className="flex cursor-pointer items-start gap-2.5 text-sm text-mute">
          <input name="remember" type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
          <span><span className="font-medium text-ink">{t("Recuérdame")}</span><span className="block text-xs">{t("No se cierra la sesión hasta que tú la cierres. Úsalo solo en tu propio equipo.")}</span></span>
        </motion.label>
        {state.error && (
          <motion.p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700" initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }} transition={{ duration: 0.45 }}>
            {t(state.error)}
          </motion.p>
        )}
        <motion.div variants={item}>
          <button className="btn w-full py-3" disabled={pending}>{pending ? t("Entrando…") : t("Entrar")}</button>
        </motion.div>
      </motion.form>
      {state.unverified && state.email && <div className="mt-3"><ResendVerification email={state.email} /></div>}
    </MotionConfig>
  );
}
