"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/site/Logo";
import { LoginForm } from "./LoginForm";
import { RegistroForm } from "./RegistroForm";

const COPY = {
  login: { title: "Diseño y supervisión de aire acondicionado y ventilación", text: "Todo el trabajo del equipo en un solo lugar: cálculos, documentos, presupuestos y visitas." },
  registro: { title: "Crea tu cuenta y cotiza en un minuto", text: "Con tu nombre y teléfono guardados, solo nos cuentas qué necesitas y te respondemos." },
};
const ease = [0.22, 1, 0.36, 1] as const;
// Los textos del panel aparecen subiendo desde abajo y desenfocados; al salir se desvanecen.
const rise = { hidden: { opacity: 0, y: 48, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease } }, out: { opacity: 0, transition: { duration: 0.25 } } };
const BACK = "mb-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-accent transition duration-300 hover:-translate-x-1 hover:bg-soft";

/** Login y registro en una sola pantalla: el panel azul con el texto se desliza al otro lado y deja ver el otro formulario. */
export function AuthShell({ initial }: { initial: "login" | "registro" }) {
  const [mode, setMode] = useState(initial);
  const reg = mode === "registro";
  const c = COPY[mode];

  // Cada formulario ocupa una mitad en pantallas anchas; en móvil solo se muestra el activo.
  const side = (active: boolean, right: boolean) => ({
    className: `${active ? "flex" : "hidden md:flex"} w-full flex-col justify-center overflow-y-auto bg-white p-8 md:absolute md:inset-y-0 md:w-1/2 ${right ? "md:right-0" : "md:left-0"} ${active ? "" : "pointer-events-none"}`,
    // Igual que los textos del panel: al salir solo se desvanece; al entrar sube desde abajo, desenfocado y nítido después.
    animate: active
      ? { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease, delay: 0.5 } }
      : { opacity: 0, y: 48, filter: "blur(6px)", transition: { opacity: { duration: 0.25 }, y: { duration: 0, delay: 0.25 }, filter: { duration: 0, delay: 0.25 } } },
    inert: !active,
  });

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-hidden md:grid md:grid-cols-2">
        <motion.div {...side(reg, false)}>
          <div className="mx-auto w-full max-w-sm">
            <Link href="/" className={BACK}>← Ir al sitio</Link>
            <h2 className="text-3xl font-bold tracking-tight">Crear cuenta</h2>
            <p className="mb-6 mt-2 text-mute">Cuenta de cliente: no da acceso al panel interno.</p>
            <RegistroForm />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-mute md:hidden">¿Ya tienes cuenta? <button onClick={() => setMode("login")} className="btn-ghost px-4 py-1.5">Inicia sesión</button></div>
          </div>
        </motion.div>

        <motion.div {...side(!reg, true)}>
          <div className="mx-auto w-full max-w-sm">
            <Link href="/" className={BACK}>← Ir al sitio</Link>
            <h2 className="text-3xl font-bold tracking-tight">Iniciar sesión</h2>
            <p className="mb-7 mt-2 text-mute">Para el equipo de Conserca y para clientes con cuenta.</p>
            <LoginForm />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-mute md:hidden">¿No tienes cuenta? <button onClick={() => setMode("registro")} className="btn-ghost px-4 py-1.5">Regístrate</button></div>
          </div>
        </motion.div>

        {/* Panel azul con el texto: se desliza de un lado al otro. Solo en pantallas anchas. */}
        <motion.div className="absolute inset-y-0 left-0 z-10 hidden w-1/2 flex-col justify-between bg-accent p-14 text-white md:flex" initial={false} animate={{ x: reg ? "100%" : "0%" }} transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}>
          <Logo className="text-white [&>span:first-child]:bg-white" />
          <AnimatePresence mode="wait">
            <motion.div key={mode} className="flex flex-1 flex-col justify-between" initial="hidden" animate="show" exit="out" transition={{ delayChildren: 0.35, staggerChildren: 0.18 }}>
              <div className="my-auto">
                <motion.h1 variants={rise} className="text-4xl font-semibold leading-tight tracking-tight">{c.title}</motion.h1>
                <motion.p variants={rise} className="mt-4 max-w-md text-white/85">{c.text}</motion.p>
              </div>
              <motion.div variants={rise}>
                <p className="mb-3 text-sm text-white/80">{reg ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}</p>
                <button onClick={() => setMode(reg ? "login" : "registro")} className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-white px-7 py-3 text-base font-bold text-accent shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)] transition duration-300 hover:scale-105 hover:shadow-[0_18px_36px_-12px_rgba(0,0,0,0.6)] active:scale-95">
                  {reg ? "Iniciar sesión" : "Crear cuenta"}
                  <svg viewBox="0 0 20 20" className={`h-5 w-5 transition-transform duration-300 ${reg ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h12M11 5l5 5-5 5" /></svg>
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
