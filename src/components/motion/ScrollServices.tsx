"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { ServiceTile } from "@/components/site/ServiceIcon";
import { ServiceScene } from "./ServiceScene";
import { SERVICES } from "@/lib/services";

export function ScrollServices() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bg = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["#ffffff", "#eef7fb", "#e3f3f9", "#eaf6f3", "#ffffff"]);
  const blobX = useTransform(scrollYProgress, [0, 1], ["0vw", "70vw"]);
  const blobY = useTransform(scrollYProgress, [0, 1], ["-10vh", "60vh"]);
  const blobScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.4, 0.9]);
  const blob2X = useTransform(scrollYProgress, [0, 1], ["0vw", "-60vw"]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], ["10vh", "-50vh"]);
  const gridY = useTransform(scrollYProgress, [0, 1], ["0px", "-400px"]);
  const [i, setI] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setI(Math.min(SERVICES.length - 1, Math.max(0, Math.floor(v * SERVICES.length)))));

  const go = (n: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    // Si el servicio no es el contiguo, se salta directo: así no pasan por pantalla los de en medio.
    window.scrollTo({ top: top + (span * (n + 0.5)) / SERVICES.length, behavior: Math.abs(n - i) > 1 ? "instant" : "smooth" });
  };
  const s = SERVICES[i];

  return (
    <section ref={ref} style={{ height: `${SERVICES.length * 140 + 60}vh` }} className="relative" aria-label="Servicios">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Fondo que se mueve con el scroll: color, manchas y rejilla. */}
        <motion.div aria-hidden className="svc-bg absolute inset-0" style={{ backgroundColor: bg }} />
        <motion.div aria-hidden className="absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-accent/25 blur-3xl" style={{ x: blobX, y: blobY, scale: blobScale }} />
        <motion.div aria-hidden className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-300/30 blur-3xl" style={{ x: blob2X, y: blob2Y }} />
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)", backgroundSize: "56px 56px", backgroundPositionY: gridY }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white to-transparent" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Lo que hacemos</p>
            <ul className="space-y-2.5">
              {SERVICES.map((x, n) => (
                <li key={x.id}>
                  <button
                    onClick={() => go(n)}
                    aria-current={n === i ? "true" : undefined}
                    className={`flex cursor-pointer items-center gap-4 text-left text-lg font-semibold tracking-tight transition-colors duration-300 md:text-xl ${n === i ? "text-accent" : "text-mute hover:text-ink"}`}
                  >
                    <ServiceTile id={x.id} active={n === i} size="h-14 w-14" icon="h-9 w-9" />
                    {x.title}
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/cotizar" className="group relative mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-lg font-bold text-white shadow-[0_14px_34px_-10px_rgba(11,126,168,0.8)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_20px_40px_-10px_rgba(11,126,168,0.9)] active:scale-[.98]">
              <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/30 [animation-duration:2.5s]" />
              Cotizar mi proyecto
              <svg viewBox="0 0 20 20" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h12M11 5l5 5-5 5" /></svg>
            </Link>
          </div>
          <div className="relative min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.14, ease: "easeIn" } }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-line bg-white p-8 shadow-[0_20px_60px_-30px_rgba(11,126,168,0.35)]"
              >
                <ServiceScene id={s.id} className="mb-6 h-44" />
                <div className="mb-3 flex items-center gap-3 text-accent">
                  <ServiceTile id={s.id} active size="h-20 w-20" icon="h-13 w-13" />
                  <span className="text-sm font-semibold uppercase tracking-wide">{s.title}</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{s.short}</h3>
                <ul className="mt-4 space-y-2 text-mute">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{p}</li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
