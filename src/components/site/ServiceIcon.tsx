"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useVisible } from "@/components/motion/useVisible";

const center = { transformBox: "fill-box", transformOrigin: "center" } as const;

// Íconos de 48×48 con relleno suave, trazo y movimiento propio. Usan currentColor, así que toman el color del contenedor.
function Art({ id, still, hot }: { id: string; still: boolean; hot: boolean }): ReactNode {
  // Con "reducir movimiento" el ícono queda quieto; si no, el movimiento se repite sin parar.
  // `hot` (ícono activo o con el cursor encima) acelera el movimiento.
  const loop = (duration: number, extra = {}) => (still ? { duration: 0 } : { duration: hot ? duration * 0.55 : duration, repeat: Infinity, ease: "easeInOut" as const, ...extra });
  switch (id) {
    case "cargas": // termómetro: el mercurio sube y salen ondas de calor
      return (
        <>
          <rect x="18" y="4" width="12" height="30" rx="6" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2" />
          <circle cx="24" cy="37" r="8" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="2" />
          <motion.rect x="22" width="4" rx="2" fill="currentColor" initial={{ y: 14, height: 22 }} animate={still ? {} : { y: [26, 12, 26], height: [10, 24, 10] }} transition={loop(3)} />
          <circle cx="24" cy="37" r="4.5" fill="currentColor" />
          {[10, 16, 22].map((y) => <path key={y} d={`M33 ${y}h4`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />)}
          {[0, 1].map((k) => (
            <motion.path key={k} d="M8 30c-3-3 3-5 0-8s3-5 0-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" initial={{ opacity: 0.6 }} animate={still ? {} : { y: [6, -6], opacity: [0, 1, 0] }} transition={loop(2, { delay: k, ease: "linear" })} />
          ))}
        </>
      );
    case "distribucion": // ductos con aire que fluye hacia los difusores
      return (
        <>
          {["M5 26H22Q28 26 28 20V9", "M22 26H43", "M28 26V41"].map((d) => (
            <g key={d}>
              <path d={d} stroke="currentColor" strokeOpacity=".2" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <motion.path d={d} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="1 7" animate={still ? {} : { strokeDashoffset: [0, -16] }} transition={loop(1.1, { ease: "linear" })} />
              <motion.circle r="2.2" fill="currentColor" initial={{ opacity: 0 }} animate={still ? {} : { opacity: [0, 1, 0] }} transition={loop(1.8, { delay: d.length * 0.03 })} cx={d.startsWith("M5") ? 12 : d.startsWith("M22") ? 32 : 28} cy={d.startsWith("M28") ? 33 : 26} />
            </g>
          ))}
          <rect x="22" y="3" width="12" height="5" rx="2" fill="currentColor" />
          <rect x="40" y="20" width="5" height="12" rx="2" fill="currentColor" />
          <rect x="22" y="41" width="12" height="5" rx="2" fill="currentColor" />
          <rect x="2" y="20" width="5" height="12" rx="2" fill="currentColor" fillOpacity=".5" />
        </>
      );
    case "ventilacion": // ventilador girando dentro de su carcasa
      return (
        <>
          <rect x="4" y="4" width="40" height="40" rx="10" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="2" />
          <circle cx="24" cy="24" r="15" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" fill="none" />
          <motion.g style={center} animate={still ? {} : { rotate: 360 }} transition={loop(2.2, { ease: "linear" })}>
            {[0, 90, 180, 270].map((a) => (
              <path key={a} transform={`rotate(${a} 24 24)`} d="M24 24C20 18 21 9 28 8C31 13 29 20 24 24Z" fill="currentColor" fillOpacity=".75" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            ))}
          </motion.g>
          <circle cx="24" cy="24" r="3.5" fill="white" stroke="currentColor" strokeWidth="2" />
        </>
      );
    case "documentos": // hoja que se escribe sola y se aprueba con una palomita
      return (
        <>
          <path d="M10 4h20l10 10v30H10V4Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M30 4v10h10" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          {[22, 28, 34].map((y, k) => (
            <motion.path key={y} d={`M16 ${y}h${k === 2 ? 10 : 16}`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 1 }} animate={still ? {} : { pathLength: [0, 1, 1, 0] }} transition={loop(4, { delay: k * 0.35, times: [0, 0.3, 0.85, 1] })} />
          ))}
          <motion.g style={center} animate={still ? {} : { scale: [0.85, 1.12, 0.85] }} transition={loop(2.2)}>
            <circle cx="37" cy="38" r="8" fill="currentColor" />
            <path d="M33 38l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </motion.g>
        </>
      );
    case "supervision": // ojo que revisa de lado a lado
      return (
        <>
          <path d="M3 24C9 13 16 9 24 9s15 4 21 15c-6 11-13 15-21 15S9 35 3 24Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <motion.g animate={still ? {} : { x: [-6, 6, -6] }} transition={loop(4)}>
            <circle cx="24" cy="24" r="9" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="2" />
            <circle cx="24" cy="24" r="4.5" fill="currentColor" />
            <circle cx="26.5" cy="21.5" r="1.5" fill="white" />
          </motion.g>
          {!still && <motion.circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" style={center} animate={{ scale: [0.9, 1.5], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />}
        </>
      );
    default:
      return null;
  }
}

export function ServiceIcon({ id, className = "h-12 w-12", hot = false, paused }: { id: string; className?: string; hot?: boolean; paused?: boolean }) {
  const reduce = !!useReducedMotion();
  const [ref, visible] = useVisible<SVGSVGElement>();
  const still = reduce || (paused ?? !visible); // `paused` lo manda el recuadro cuando el ícono va dentro de uno
  return (
    <svg ref={ref} viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <Art id={id} still={still} hot={hot} />
    </svg>
  );
}

/** Recuadro con degradado que da peso al ícono. Flota suave; con el cursor se inclina y acelera el ícono; `active` lo llena de color, lo hace latir y le suma aro y destello. */
export function ServiceTile({ id, active = false, size = "h-16 w-16", icon = "h-10 w-10" }: { id: string; active?: boolean; size?: string; icon?: string }) {
  const reduce = !!useReducedMotion();
  const [ref, visible] = useVisible<HTMLSpanElement>();
  const still = reduce || !visible; // el recuadro deja de flotar cuando no se ve
  const [hover, setHover] = useState(false);
  return (
    <motion.span
      ref={ref}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={still ? undefined : { scale: 1.12, rotate: -4 }}
      animate={still ? {} : active ? { scale: [1, 1.12, 1], y: 0 } : { scale: 1, y: [0, -2.5, 0] }}
      transition={active ? { duration: 0.6 } : { scale: { duration: 0.3 }, y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" } }}
      className={`relative flex shrink-0 items-center justify-center rounded-2xl border transition-colors duration-500 ${size} ${active ? "border-transparent bg-gradient-to-br from-accent-solid to-accent-solid-2 text-white shadow-[0_12px_28px_-8px_rgba(11,126,168,0.7)]" : "border-line bg-gradient-to-br from-soft to-surface text-accent"}`}
    >
      {active && !still && (
        <>
          <motion.span aria-hidden className="absolute inset-0 rounded-2xl ring-2 ring-accent/60" animate={{ scale: [1, 1.45], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
          <span aria-hidden className="absolute inset-0 overflow-hidden rounded-2xl">
            <motion.span className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/35" animate={{ left: ["-60%", "160%"] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }} />
          </span>
        </>
      )}
      {/* Los íconos inactivos solo se mueven con el cursor encima. */}
      <ServiceIcon id={id} className={icon} hot={active || hover} paused={still || (!active && !hover)} />
    </motion.span>
  );
}
