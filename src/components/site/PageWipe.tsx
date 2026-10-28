"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSaveData } from "@/components/motion/useSaveData";
import { Logo } from "./Logo";

type Phase = "idle" | "cover" | "reveal";

/**
 * Al saltar entre el sitio y el panel, una cortina con bordes que se desvanecen sube y tapa la pantalla,
 * se cambia de página y la cortina se va hacia arriba.
 *
 * Es una máquina de estados guiada por el fin de cada animación (no por temporizadores sueltos):
 * idle → cover (sube) → [se navega al terminar de subir] → reveal (se va) → idle.
 * Mientras no está en idle se ignoran los clics nuevos, para que no se encimen dos navegaciones.
 */
export function PageWipe() {
  const [phase, setPhase] = useState<Phase>("idle");
  const path = usePathname();
  const router = useRouter();
  const saveData = useSaveData();
  const reduce = useReducedMotion() || saveData;
  const busy = useRef(false);
  const job = useRef({ from: "", target: "", pushed: false });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (reduce) return;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      const here = location.pathname;
      if (url.origin !== location.origin || url.pathname === here) return;
      // Solo los saltos entre el sitio y el panel llevan cortina (entrar al panel y volver al sitio desde él). El login usa las animaciones normales.
      const inPanel = here.startsWith("/app") && here !== "/app/login"; // el login no cuenta como panel
      const wipe = (url.pathname === "/app" && !here.startsWith("/app")) || (url.pathname === "/" && inPanel);
      if (!wipe) return;
      // En captura y con stopPropagation: así el Link de Next no navega antes de que la cortina cubra la pantalla.
      e.preventDefault();
      e.stopPropagation();
      if (busy.current) return;
      busy.current = true;
      job.current = { from: here, target: url.pathname + url.search, pushed: false };
      setPhase("cover");
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(timer.current);
      busy.current = false;
    };
  }, [reduce]);

  // La página nueva ya cargó (la ruta cambió): se retira la cortina.
  useEffect(() => {
    if (phase !== "cover" || !job.current.pushed || path === job.current.from) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPhase("reveal"), 80);
  }, [path, phase]);

  const onDone = () => {
    if (phase === "cover" && !job.current.pushed) {
      // La cortina ya tapa todo: ahora sí se navega. Si la ruta nunca cambia, se retira sola a los 8 s.
      job.current.pushed = true;
      router.push(job.current.target);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPhase((p) => (p === "cover" ? "reveal" : p)), 8000);
    } else if (phase === "reveal") {
      clearTimeout(timer.current);
      busy.current = false;
      setPhase("idle");
    }
  };

  if (reduce) return null;
  const on = phase === "cover";
  // Cortina más alta que la pantalla: el centro es sólido y los 160 px de arriba y de abajo se desvanecen a transparente,
  // así el borde que sube no se ve como un cuadro duro.
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 z-[100] flex items-center justify-center"
      style={{
        top: -160,
        height: "calc(100vh + 320px)",
        background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent) 16%, var(--surface)) 160px, color-mix(in srgb, #22d3ee 14%, var(--surface)) calc(100% - 160px), transparent)",
        pointerEvents: phase === "idle" ? "none" : "auto",
      }}
      initial={{ y: "100%" }}
      animate={{ y: on ? "0%" : phase === "reveal" ? "-100%" : "100%" }}
      transition={phase === "idle" ? { duration: 0 } : on ? { duration: 0.6, ease: [0.2, 0.7, 0.3, 1] } : { duration: 0.55, ease: [0.45, 0, 0.2, 1] }}
      onAnimationComplete={onDone}
    >
      <motion.div className="text-accent" animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.92 }} transition={{ duration: 0.25, delay: on ? 0.12 : 0 }}>
        <Logo className="h-14" />
      </motion.div>
    </motion.div>
  );
}
