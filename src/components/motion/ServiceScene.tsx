"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useVisible } from "./useVisible";

const CYAN = "#22d3ee";
const WARM = "#fb923c";
const center = { transformBox: "fill-box", transformOrigin: "center" } as const;

// Una escena ilustrada por servicio (320×150): primero se dibuja y luego queda en movimiento continuo.
function Scene({ id, still }: { id: string; still: boolean }): ReactNode {
  const loop = (duration: number, extra = {}) => (still ? { duration: 0 } : { duration, repeat: Infinity, ease: "easeInOut" as const, ...extra });
  const draw = (delay = 0) => ({ initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: 0.8, delay, ease: "easeInOut" as const } });
  // Entrada escalonada: cada pieza aparece subiendo un poco, una tras otra.
  const pop = (i: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.15 + i * 0.08, ease: "easeOut" as const } });

  switch (id) {
    case "cargas": // edificio con ventanas que se calientan, sol que pulsa y barras de carga
      return (
        <>
          <motion.rect x="28" y="26" width="104" height="104" rx="8" fill="currentColor" fillOpacity=".08" stroke="url(#sg)" strokeWidth="2.5" {...draw()} />
          {[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => (
            <motion.rect key={`${r}${c}`} x={42 + c * 31} y={38 + r * 22} width="20" height="14" rx="3" fill={(r + c) % 2 ? WARM : CYAN} initial={{ opacity: 0.15 }} animate={still ? {} : { opacity: [0.15, 0.9, 0.15] }} transition={loop(3.2, { delay: (r + c) * 0.35 })} />
          )))}
          {/* El calor sube desde el edificio */}
          {[48, 80, 112].map((x, k) => (
            <motion.path key={x} d={`M${x} 22q-5 -6 0 -12t0 -12`} stroke={WARM} strokeWidth="2" strokeLinecap="round" fill="none" initial={{ opacity: 0 }} animate={still ? {} : { opacity: [0, 0.7, 0], y: [4, -8] }} transition={loop(2.4, { delay: k * 0.7, ease: "easeOut" })} />
          ))}
          <motion.circle cx="170" cy="38" r="11" fill="none" stroke={WARM} strokeWidth="2" style={center} initial={{ opacity: 0 }} animate={still ? {} : { scale: [1, 2.6], opacity: [0.7, 0] }} transition={loop(2.2, { ease: "easeOut" })} />
          <motion.g style={center} animate={still ? {} : { rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}>
            <circle cx="170" cy="38" r="11" fill={WARM} />
            {Array.from({ length: 8 }, (_, k) => <path key={k} d="M170 18v6" stroke={WARM} strokeWidth="3" strokeLinecap="round" transform={`rotate(${k * 45} 170 38)`} />)}
          </motion.g>
          <path d="M196 124H304" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
          {[34, 58, 82, 102].map((h, k) => (
            <g key={k}>
              <motion.rect x={202 + k * 26} y={124 - h} width="16" height={h} rx="4" fill="url(#sg)" style={{ transformBox: "fill-box", transformOrigin: "bottom" }} initial={{ scaleY: 0 }} animate={still ? { scaleY: 1 } : { scaleY: [0, 1, 1, 0.82, 1] }} transition={still ? { duration: 0 } : { duration: 4, repeat: Infinity, delay: 0.5 + k * 0.2, times: [0, 0.25, 0.6, 0.8, 1], ease: "easeInOut" }} />
              <motion.circle cx={210 + k * 26} cy={124 - h - 6} r="3" fill={WARM} initial={{ opacity: 0 }} animate={still ? { opacity: 1 } : { opacity: [0, 1, 1, 1, 1], y: [h, 0, 0, 0.18 * h, 0] }} transition={still ? { duration: 0 } : { duration: 4, repeat: Infinity, delay: 0.5 + k * 0.2, times: [0, 0.25, 0.6, 0.8, 1], ease: "easeInOut" }} />
            </g>
          ))}
          <motion.path d="M198 100 Q232 70 256 64 T304 36" stroke={WARM} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 6" fill="none" animate={still ? {} : { strokeDashoffset: [0, -16] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
          <motion.circle cx="304" cy="36" r="4" fill={WARM} style={center} animate={still ? {} : { scale: [1, 1.8, 1] }} transition={loop(1.6)} />
        </>
      );
    case "distribucion": { // ducto principal que reparte aire a tres difusores, con aire que realmente recorre los ductos
      const outlets: [number, number][] = [[96, 38], [176, 124], [256, 38]];
      return (
        <>
          <motion.rect x="14" y="16" width="292" height="118" rx="12" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeOpacity=".4" strokeWidth="2" strokeDasharray="6 6" {...draw()} />
          <motion.path d="M18 76H286" stroke="url(#sg)" strokeOpacity=".3" strokeWidth="16" strokeLinecap="round" {...draw(0.2)} />
          {outlets.map(([x, y], k) => <motion.path key={x} d={`M${x} 76V${y}`} stroke="url(#sg)" strokeOpacity=".3" strokeWidth="12" strokeLinecap="round" {...draw(0.4 + k * 0.15)} />)}
          {/* Partículas de aire: salen del equipo, avanzan por el ducto y suben o bajan por cada rama */}
          {outlets.flatMap(([x, y], k) => [0, 1, 2].map((n) => (
            <motion.circle key={`${x}${n}`} r="3" fill={CYAN} initial={{ cx: 18, cy: 76, opacity: 0 }} animate={still ? { cx: x, cy: 76, opacity: 0.8 } : { cx: [18, x, x], cy: [76, 76, y], opacity: [0, 1, 0] }} transition={still ? { duration: 0 } : { duration: 2.6, repeat: Infinity, ease: "linear", delay: 0.9 + k * 0.25 + n * 0.85, times: [0, 0.68, 1] }} />
          )))}
          {outlets.map(([x, y], k) => (
            <g key={x}>
              <motion.g {...pop(k + 3)}>
                <rect x={x - 14} y={y - 5} width="28" height="10" rx="4" fill="currentColor" />
              </motion.g>
              {[0, 1].map((w) => (
                <motion.circle key={w} cx={x} cy={y} r="8" fill="none" stroke={CYAN} strokeWidth="2" style={center} initial={{ opacity: 0 }} animate={still ? {} : { scale: [1, 3.2], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1.4 + k * 0.4 + w * 1 }} />
              ))}
            </g>
          ))}
          <motion.rect x="6" y="62" width="14" height="28" rx="4" fill={CYAN} style={center} animate={still ? {} : { scaleY: [1, 1.12, 1] }} transition={loop(1.4)} />
        </>
      );
    }
    case "ventilacion": // estacionamiento: el aire viciado sale por un extractor y un sensor vigila el CO
      return (
        <>
          <motion.path d="M24 130V44H296V130" stroke="url(#sg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" {...draw()} />
          <path d="M16 130H304" stroke="currentColor" strokeOpacity=".4" strokeWidth="2.5" strokeLinecap="round" />
          {[60, 150].map((x, k) => (
            <motion.g key={x} {...pop(k)}>
              <rect x={x} y="108" width="64" height="16" rx="6" fill="currentColor" fillOpacity=".7" />
              <path d={`M${x + 12} 108l8-14h28l8 14`} fill="currentColor" fillOpacity=".35" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx={x + 14} cy="125" r="6" fill="currentColor" /><circle cx={x + 50} cy="125" r="6" fill="currentColor" />
            </motion.g>
          ))}
          {/* Humo de escape que sube y se disipa */}
          {[52, 142].map((x, k) => [0, 1].map((n) => (
            <motion.circle key={`${x}${n}`} cx={x} cy="118" r="3" fill="currentColor" initial={{ opacity: 0 }} animate={still ? {} : { opacity: [0, 0.4, 0], y: [0, -26], x: [0, -6], scale: [0.6, 2.2] }} transition={loop(2.8, { delay: k * 0.9 + n * 1.4, ease: "easeOut" })} style={center} />
          )))}
          {Array.from({ length: 7 }, (_, k) => (
            <motion.circle key={k} cy={86 - (k % 3) * 12} r={3 + (k % 2)} fill={CYAN} initial={{ cx: 60, opacity: 0 }} animate={still ? { cx: 200, opacity: 0.6 } : { cx: [60, 250], opacity: [0, 0.9, 0.9, 0], r: [3, 6] }} transition={loop(3, { delay: k * 0.42, ease: "easeIn" })} />
          ))}
          {/* Sensor de CO: parpadea en ámbar cuando hay humo y vuelve a verde al extraer */}
          <rect x="34" y="56" width="22" height="16" rx="4" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="2" />
          <motion.circle cx="45" cy="64" r="3.5" initial={{ fill: CYAN }} animate={still ? {} : { fill: [CYAN, WARM, WARM, CYAN, CYAN] }} transition={loop(3, { times: [0, 0.3, 0.55, 0.8, 1] })} />
          <motion.circle cx="45" cy="64" r="3.5" fill="none" stroke={WARM} strokeWidth="1.5" style={center} initial={{ opacity: 0 }} animate={still ? {} : { scale: [1, 1, 1, 2.6, 2.6], opacity: [0, 0, 0.9, 0, 0] }} transition={loop(3, { times: [0, 0.28, 0.3, 0.6, 1], ease: "easeOut" })} />
          <circle cx="264" cy="80" r="24" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="2.5" />
          <motion.g style={center} animate={still ? {} : { rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
            {[0, 120, 240].map((a) => <path key={a} transform={`rotate(${a} 264 80)`} d="M264 80C258 70 261 60 270 58C273 66 271 74 264 80Z" fill="currentColor" fillOpacity=".8" />)}
          </motion.g>
          <circle cx="264" cy="80" r="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <motion.path d="M290 70h18M290 80h24M290 90h18" stroke={CYAN} strokeWidth="3" strokeLinecap="round" animate={still ? {} : { x: [0, 8, 0], opacity: [1, 0.3, 1] }} transition={loop(1.6)} />
        </>
      );
    case "documentos": // hojas apiladas: una se escribe sola, avanza la barra y se estampa el visto bueno
      return (
        <>
          {[-9, 7].map((r, k) => <motion.rect key={r} x="104" y="14" width="112" height="124" rx="8" fill="currentColor" fillOpacity={0.07 + k * 0.05} stroke="currentColor" strokeOpacity=".35" strokeWidth="2" style={center} initial={{ rotate: 0 }} animate={still ? { rotate: r } : { rotate: [0, r, r + (k ? 2 : -2), r] }} transition={still ? { duration: 0 } : { duration: 1.4, delay: 0.1 + k * 0.1, times: [0, 0.5, 0.75, 1], ease: "easeOut" }} />)}
          <motion.g animate={still ? {} : { y: [0, -4, 0] }} transition={loop(4)}>
            <rect x="104" y="14" width="112" height="124" rx="8" fill="white" fillOpacity=".9" stroke="url(#sg)" strokeWidth="2.5" />
            <rect x="116" y="26" width="40" height="8" rx="4" fill="currentColor" />
            {[48, 62, 76].map((y, k) => <motion.path key={y} d={`M116 ${y}H${k === 2 ? 170 : 204}`} stroke="currentColor" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={still ? { pathLength: 1 } : { pathLength: [0, 1, 1, 0] }} transition={loop(5, { delay: k * 0.5, times: [0, 0.3, 0.85, 1] })} />)}
            <motion.rect x="174" y="70" width="2.5" height="12" rx="1" fill={WARM} animate={still ? {} : { opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
            {[0, 1, 2, 3].map((k) => <motion.rect key={k} x={118 + k * 14} y={118 - [14, 26, 20, 34][k]} width="9" height={[14, 26, 20, 34][k]} rx="2" fill={k % 2 ? CYAN : "currentColor"} style={{ transformBox: "fill-box", transformOrigin: "bottom" }} initial={{ scaleY: 0 }} animate={still ? { scaleY: 1 } : { scaleY: [0, 1, 1, 0] }} transition={loop(5, { delay: 0.6 + k * 0.15, times: [0, 0.2, 0.85, 1] })} />)}
            <rect x="116" y="124" width="80" height="5" rx="2.5" fill="currentColor" fillOpacity=".15" />
            <motion.rect x="116" y="124" width="80" height="5" rx="2.5" fill="url(#sg)" style={{ transformBox: "fill-box", transformOrigin: "left" }} initial={{ scaleX: 0 }} animate={still ? { scaleX: 1 } : { scaleX: [0, 1, 1, 0] }} transition={loop(5, { times: [0, 0.55, 0.9, 1] })} />
            {/* Sello: cae con un golpe, rebota y se queda */}
            <motion.g style={center} initial={{ opacity: 0 }} animate={still ? { opacity: 1, rotate: -12 } : { opacity: [0, 0, 1, 1, 1, 0], scale: [2, 2, 0.9, 1.08, 1, 1], rotate: [-30, -30, -12, -12, -12, -12] }} transition={loop(5, { times: [0, 0.5, 0.58, 0.64, 0.9, 1] })}>
              <circle cx="190" cy="104" r="16" fill="white" fillOpacity=".7" stroke={WARM} strokeWidth="3" />
              <path d="M182 104l6 6 11-12" stroke={WARM} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </motion.g>
          </motion.g>
          <path d="M40 120h30M40 100h44M250 50h34M250 70h22" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "supervision": { // la lupa visita cada punto del plano y, al llegar, el punto se valida y se palomea en la lista
      const T = 8;
      const stops: [number, number, number][] = [[58, 46, 0.08], [160, 54, 0.32], [78, 104, 0.6]]; // x, y, instante de llegada (0–1)
      return (
        <>
          <motion.path d="M24 24H196V126H24Z M24 70H92 M92 24V70 M130 126V86H196" stroke="url(#sg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity=".06" {...draw()} />
          {/* Barrido de escaneo sobre el plano */}
          <motion.rect x="24" y="24" width="3" height="102" fill={CYAN} fillOpacity=".5" initial={{ x: 0 }} animate={still ? {} : { x: [0, 170, 0], opacity: [0, 0.7, 0] }} transition={loop(T / 2, { times: [0, 0.5, 1] })} />
          {stops.map(([x, y, t], k) => (
            <g key={k}>
              <motion.circle cx={x} cy={y} r="5" initial={{ fill: WARM }} animate={still ? { fill: CYAN } : { fill: [WARM, WARM, CYAN, CYAN, WARM] }} style={center} transition={loop(T, { times: [0, t, t + 0.04, 0.92, 1] })} />
              <motion.circle cx={x} cy={y} r="5" fill="none" stroke={CYAN} strokeWidth="2" style={center} initial={{ opacity: 0 }} animate={still ? {} : { scale: [1, 1, 3.4, 3.4], opacity: [0, 0.9, 0, 0] }} transition={loop(T, { times: [0, t, t + 0.12, 1], ease: "easeOut" })} />
            </g>
          ))}
          <motion.g initial={{ x: 58, y: 46 }} animate={still ? { x: 78, y: 104 } : { x: [58, 58, 160, 160, 78, 78, 58], y: [46, 46, 54, 54, 104, 104, 46] }} transition={loop(T, { times: [0, 0.16, 0.3, 0.45, 0.58, 0.78, 1] })}>
            <circle cx="0" cy="0" r="16" fill="white" fillOpacity=".35" stroke="currentColor" strokeWidth="3.5" />
            <path d="M11 11l14 14" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          </motion.g>
          {[0, 1, 2, 3].map((k) => {
            const t = [0.1, 0.34, 0.62, 0.84][k];
            return (
              <motion.g key={k} {...pop(k)}>
                <rect x="222" y={30 + k * 26} width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <motion.path d={`M225 ${38 + k * 26}l4 4 7-8`} stroke={CYAN} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ pathLength: 0 }} animate={still ? { pathLength: 1 } : { pathLength: [0, 0, 1, 1, 0] }} transition={loop(T, { times: [0, t, t + 0.06, 0.95, 1] })} />
                <rect x="246" y={34 + k * 26} width={[52, 44, 56, 38][k]} height="8" rx="4" fill="currentColor" fillOpacity=".35" />
              </motion.g>
            );
          })}
        </>
      );
    }
    default:
      return null;
  }
}

/**
 * `mode="always"`: se mueve mientras está en pantalla. `mode="hover"`: queda quieta hasta que se pasa el cursor por la tarjeta
 * (el ancestro con `data-scene-host`) o por la propia escena; útil cuando hay varias a la vez.
 */
export function ServiceScene({ id, className = "", mode = "always" }: { id: string; className?: string; mode?: "always" | "hover" }) {
  const reduce = !!useReducedMotion();
  const [ref, visible, seen] = useVisible<HTMLDivElement>();
  const [hot, setHot] = useState(false);
  useEffect(() => {
    if (mode !== "hover") return;
    const host = ref.current?.closest("[data-scene-host]") ?? ref.current;
    if (!host) return;
    const on = () => setHot(true), off = () => setHot(false);
    host.addEventListener("pointerenter", on); host.addEventListener("pointerleave", off);
    host.addEventListener("focusin", on); host.addEventListener("focusout", off);
    return () => { host.removeEventListener("pointerenter", on); host.removeEventListener("pointerleave", off); host.removeEventListener("focusin", on); host.removeEventListener("focusout", off); };
  }, [mode, ref]);
  // Fuera de pantalla (o sin cursor encima en modo hover) queda quieta: ahorra CPU y batería.
  const still = reduce || !visible || (mode === "hover" && !hot);
  return (
    <div ref={ref} className={`overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-soft via-surface to-soft/40 ${className}`}>
      <svg viewBox="0 0 320 150" className="h-full w-full text-accent" fill="none" aria-hidden>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" />
            <stop offset="1" stopColor={CYAN} />
          </linearGradient>
          <pattern id="sdots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="currentColor" /></pattern>
          <radialGradient id="sglow"><stop offset="0" stopColor={CYAN} stopOpacity=".35" /><stop offset="1" stopColor={CYAN} stopOpacity="0" /></radialGradient>
        </defs>
        {/* Fondo vivo: puntos que derivan despacio y un resplandor que respira */}
        <motion.rect x="-20" y="0" width="360" height="150" fill="url(#sdots)" fillOpacity=".18" animate={still ? {} : { x: [0, 20] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
        <motion.circle key={id} cx={id === "distribucion" ? 60 : 250} cy="30" r="70" fill="url(#sglow)" style={center} animate={still ? {} : { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
        {seen && <Scene id={id} still={still} />}
      </svg>
    </div>
  );
}
