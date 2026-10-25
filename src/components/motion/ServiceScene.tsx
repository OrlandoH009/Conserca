"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const CYAN = "#22d3ee";
const WARM = "#fb923c";
const center = { transformBox: "fill-box", transformOrigin: "center" } as const;

// Una escena ilustrada por servicio (320×150): primero se dibuja y luego queda en movimiento continuo.
function Scene({ id, still }: { id: string; still: boolean }): ReactNode {
  const loop = (duration: number, extra = {}) => (still ? { duration: 0 } : { duration, repeat: Infinity, ease: "easeInOut" as const, ...extra });
  const draw = (delay = 0) => ({ initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: 0.8, delay, ease: "easeInOut" as const } });

  switch (id) {
    case "cargas": // edificio con ventanas que se calientan, sol y barras de carga
      return (
        <>
          <motion.rect x="28" y="26" width="104" height="104" rx="8" fill="currentColor" fillOpacity=".08" stroke="url(#sg)" strokeWidth="2.5" {...draw()} />
          {[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => (
            <motion.rect key={`${r}${c}`} x={42 + c * 31} y={38 + r * 22} width="20" height="14" rx="3" fill={(r + c) % 2 ? WARM : CYAN} initial={{ opacity: 0.15 }} animate={still ? {} : { opacity: [0.15, 0.85, 0.15] }} transition={loop(3.2, { delay: (r + c) * 0.35 })} />
          )))}
          <motion.g style={center} animate={still ? {} : { rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}>
            <circle cx="170" cy="38" r="11" fill={WARM} />
            {Array.from({ length: 8 }, (_, k) => <path key={k} d="M170 18v6" stroke={WARM} strokeWidth="3" strokeLinecap="round" transform={`rotate(${k * 45} 170 38)`} />)}
          </motion.g>
          <path d="M196 124H304" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
          {[34, 58, 82, 102].map((h, k) => (
            <motion.rect key={k} x={202 + k * 26} y={124 - h} width="16" height={h} rx="4" fill="url(#sg)" style={{ transformBox: "fill-box", transformOrigin: "bottom" }} initial={{ scaleY: 0 }} animate={still ? { scaleY: 1 } : { scaleY: [0, 1, 1, 0.82, 1] }} transition={still ? { duration: 0 } : { duration: 4, repeat: Infinity, delay: 0.5 + k * 0.2, times: [0, 0.25, 0.6, 0.8, 1], ease: "easeInOut" }} />
          ))}
          <motion.path d="M198 100 Q232 70 256 64 T304 36" stroke={WARM} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 6" fill="none" animate={still ? {} : { strokeDashoffset: [0, -16] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
        </>
      );
    case "distribucion": // ducto principal que reparte aire a tres difusores
      return (
        <>
          <motion.rect x="14" y="16" width="292" height="118" rx="12" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".4" strokeWidth="2" strokeDasharray="6 6" {...draw()} />
          <path d="M18 76H286" stroke="url(#sg)" strokeOpacity=".3" strokeWidth="16" strokeLinecap="round" />
          {[96, 176, 256].map((x) => <path key={x} d={`M${x} 76V${x === 176 ? 124 : 38}`} stroke="url(#sg)" strokeOpacity=".3" strokeWidth="12" strokeLinecap="round" />)}
          {["M18 76H286", "M96 76V38", "M176 76V124", "M256 76V38"].map((d, k) => (
            <motion.path key={d} d={d} stroke="url(#sg)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" fill="none" animate={still ? {} : { strokeDashoffset: [0, -20] }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear", delay: k * 0.1 }} />
          ))}
          {[[96, 34], [176, 128], [256, 34]].map(([x, y], k) => (
            <g key={x}>
              <rect x={x - 14} y={y - 5} width="28" height="10" rx="4" fill="currentColor" />
              {[0, 1].map((w) => (
                <motion.circle key={w} cx={x} cy={y} r="8" fill="none" stroke={CYAN} strokeWidth="2" style={center} initial={{ opacity: 0 }} animate={still ? {} : { scale: [1, 3.2], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: k * 0.4 + w * 1 }} />
              ))}
            </g>
          ))}
          <rect x="6" y="62" width="14" height="28" rx="4" fill={CYAN} />
        </>
      );
    case "ventilacion": // estacionamiento: el aire viciado sale por un extractor
      return (
        <>
          <motion.path d="M24 130V44H296V130" stroke="url(#sg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" {...draw()} />
          <path d="M16 130H304" stroke="currentColor" strokeOpacity=".4" strokeWidth="2.5" strokeLinecap="round" />
          {[60, 150].map((x) => (
            <g key={x}>
              <rect x={x} y="108" width="64" height="16" rx="6" fill="currentColor" fillOpacity=".7" />
              <path d={`M${x + 12} 108l8-14h28l8 14`} fill="currentColor" fillOpacity=".35" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx={x + 14} cy="125" r="6" fill="currentColor" /><circle cx={x + 50} cy="125" r="6" fill="currentColor" />
            </g>
          ))}
          {Array.from({ length: 7 }, (_, k) => (
            <motion.circle key={k} cy={86 - (k % 3) * 12} r={3 + (k % 2)} fill={CYAN} initial={{ cx: 60, opacity: 0 }} animate={still ? { cx: 200, opacity: 0.6 } : { cx: [60, 250], opacity: [0, 0.9, 0.9, 0], r: [3, 6] }} transition={loop(3, { delay: k * 0.42, ease: "easeIn" })} />
          ))}
          <circle cx="264" cy="80" r="24" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="2.5" />
          <motion.g style={center} animate={still ? {} : { rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
            {[0, 120, 240].map((a) => <path key={a} transform={`rotate(${a} 264 80)`} d="M264 80C258 70 261 60 270 58C273 66 271 74 264 80Z" fill="currentColor" fillOpacity=".8" />)}
          </motion.g>
          <circle cx="264" cy="80" r="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <motion.path d="M290 70h18M290 80h24M290 90h18" stroke={CYAN} strokeWidth="3" strokeLinecap="round" animate={still ? {} : { x: [0, 8, 0], opacity: [1, 0.3, 1] }} transition={loop(1.6)} />
        </>
      );
    case "documentos": // hojas apiladas, una se escribe sola y se sella
      return (
        <>
          {[-9, 7].map((r, k) => <motion.rect key={r} x="104" y="14" width="112" height="124" rx="8" fill="currentColor" fillOpacity={0.07 + k * 0.05} stroke="currentColor" strokeOpacity=".35" strokeWidth="2" style={center} initial={{ rotate: 0 }} animate={{ rotate: r }} transition={{ duration: 0.7, delay: 0.1 }} />)}
          <motion.g animate={still ? {} : { y: [0, -4, 0] }} transition={loop(4)}>
            <rect x="104" y="14" width="112" height="124" rx="8" fill="white" fillOpacity=".9" stroke="url(#sg)" strokeWidth="2.5" />
            <rect x="116" y="26" width="40" height="8" rx="4" fill="currentColor" />
            {[48, 62, 76].map((y, k) => <motion.path key={y} d={`M116 ${y}H${k === 2 ? 170 : 204}`} stroke="currentColor" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={still ? { pathLength: 1 } : { pathLength: [0, 1, 1, 0] }} transition={loop(5, { delay: k * 0.5, times: [0, 0.3, 0.85, 1] })} />)}
            {[0, 1, 2, 3].map((k) => <rect key={k} x={118 + k * 14} y={118 - [14, 26, 20, 34][k]} width="9" height={[14, 26, 20, 34][k]} rx="2" fill={k % 2 ? CYAN : "currentColor"} />)}
            <motion.g style={center} animate={still ? {} : { scale: [0.8, 1.15, 1], rotate: [-18, -8, -12] }} transition={loop(2.6)}>
              <circle cx="190" cy="110" r="16" fill="none" stroke={WARM} strokeWidth="3" />
              <path d="M182 110l6 6 11-12" stroke={WARM} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </motion.g>
          </motion.g>
          <path d="M40 120h30M40 100h44M250 50h34M250 70h22" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "supervision": // plano con lupa que revisa y lista que se va palomeando
      return (
        <>
          <motion.path d="M24 24H196V126H24Z M24 70H92 M92 24V70 M130 126V86H196" stroke="url(#sg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity=".06" {...draw()} />
          {[[58, 46], [160, 54], [78, 104]].map(([x, y], k) => <motion.circle key={k} cx={x} cy={y} r="5" fill={WARM} animate={still ? {} : { scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }} style={center} transition={loop(2, { delay: k * 0.6 })} />)}
          <motion.g animate={still ? { x: 60, y: 30 } : { x: [20, 120, 60, 20], y: [20, 40, 80, 20] }} transition={loop(7)}>
            <circle cx="0" cy="0" r="20" fill="white" fillOpacity=".35" stroke="currentColor" strokeWidth="3.5" />
            <path d="M14 14l16 16" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          </motion.g>
          {[0, 1, 2, 3].map((k) => (
            <g key={k}>
              <rect x="222" y={30 + k * 26} width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <motion.path d={`M225 ${38 + k * 26}l4 4 7-8`} stroke={CYAN} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ pathLength: 0 }} animate={still ? { pathLength: 1 } : { pathLength: [0, 1, 1, 0] }} transition={loop(6, { delay: k * 0.9, times: [0, 0.15, 0.85, 1] })} />
              <rect x="246" y={34 + k * 26} width={[52, 44, 56, 38][k]} height="8" rx="4" fill="currentColor" fillOpacity=".35" />
            </g>
          ))}
        </>
      );
    default:
      return null;
  }
}

export function ServiceScene({ id, className = "" }: { id: string; className?: string }) {
  const still = !!useReducedMotion();
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-soft via-white to-soft/40 ${className}`}>
      <svg viewBox="0 0 320 150" className="h-full w-full text-accent" fill="none" aria-hidden>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" />
            <stop offset="1" stopColor={CYAN} />
          </linearGradient>
        </defs>
        <Scene id={id} still={still} />
      </svg>
    </div>
  );
}
