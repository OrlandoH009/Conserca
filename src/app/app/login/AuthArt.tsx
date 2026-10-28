"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Fondo animado del panel azul. Login: corrientes de aire que fluyen. Registro: ondas que se expanden y tarjetas que suben.
 * Al cambiar de modo se funde de uno al otro.
 */
export function AuthArt({ mode }: { mode: "login" | "registro" }) {
  const still = !!useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div key={mode} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
          {mode === "login" ? <Flow still={still} /> : <Ripples still={still} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const WAVES = [
  "M-20 120 C 120 40, 240 200, 380 120 S 600 60, 640 130",
  "M-20 230 C 100 160, 260 300, 400 220 S 590 170, 640 240",
  "M-20 360 C 140 290, 220 430, 380 350 S 580 300, 640 370",
  "M-20 500 C 120 430, 280 570, 420 490 S 580 440, 640 510",
  "M-20 640 C 100 580, 250 700, 400 630 S 590 590, 640 650",
];

function Flow({ still }: { still: boolean }) {
  return (
    <>
      <motion.div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" animate={still ? {} : { x: [0, -50, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -left-20 bottom-24 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl" animate={still ? {} : { x: [0, 60, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
      <svg viewBox="0 0 620 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" fill="none">
        {WAVES.map((d, i) => (
          <g key={d}>
            <path d={d} stroke="white" strokeOpacity=".16" strokeWidth="1.5" />
            <motion.path d={d} stroke="white" strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 22" animate={still ? {} : { strokeDashoffset: [0, -96] }} transition={{ duration: 3.5 + i * 0.9, repeat: Infinity, ease: "linear" }} />
          </g>
        ))}
        {Array.from({ length: 9 }, (_, k) => (
          <motion.circle key={k} cy={90 + k * 70} r={2 + (k % 3)} fill="white" initial={{ cx: -10, opacity: 0 }} animate={still ? { cx: 300, opacity: 0.5 } : { cx: [-10, 640], opacity: [0, 0.8, 0.8, 0] }} transition={{ duration: 7 + (k % 4) * 1.5, repeat: Infinity, delay: k * 0.8, ease: "linear" }} />
        ))}
      </svg>
    </>
  );
}

const CARDS = [
  { label: "Nombre", x: "12%", delay: 0, dur: 11 },
  { label: "Teléfono", x: "52%", delay: 3.5, dur: 13 },
  { label: "Cotización lista", x: "26%", delay: 7, dur: 12 },
];

function Ripples({ still }: { still: boolean }) {
  return (
    <>
      <div className="absolute -bottom-32 -right-32 h-80 w-80">
        {[0, 1, 2, 3].map((k) => (
          <motion.span key={k} className="absolute inset-0 rounded-full border-2 border-white/40" initial={{ scale: 0.2, opacity: 0.7 }} animate={still ? { scale: 1.4, opacity: 0.2 } : { scale: [0.2, 2.6], opacity: [0.7, 0] }} transition={{ duration: 6, repeat: Infinity, delay: k * 1.5, ease: "easeOut" }} />
        ))}
        <span className="absolute inset-0 m-auto h-5 w-5 rounded-full bg-white/70" />
      </div>
      <motion.div className="absolute -left-16 top-16 h-60 w-60 rounded-full bg-white/10 blur-3xl" animate={still ? {} : { x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      {CARDS.map((c) => (
        <motion.div key={c.label} className="absolute flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm" style={{ left: c.x }} initial={{ y: "92vh", opacity: 0 }} animate={still ? { y: "64vh", opacity: 0.8 } : { y: ["92vh", "6vh"], opacity: [0, 0.6, 0.6, 0] }} transition={{ duration: c.dur, repeat: Infinity, delay: c.delay, ease: "linear", times: [0, 0.12, 0.85, 1] }}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-accent">✓</span>
          {c.label}
        </motion.div>
      ))}
    </>
  );
}
