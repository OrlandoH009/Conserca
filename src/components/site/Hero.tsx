"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { Airflow } from "@/components/motion/Airflow";

const ease = [0.22, 1, 0.36, 1] as const;
const item = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay: 0.15 + i * 0.14, ease },
});

export function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative flex min-h-screen items-center overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-80"><Airflow /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white" aria-hidden />
        <div className="relative mx-auto w-full max-w-5xl px-6 pb-16 pt-28 text-center">
          <motion.p {...item(0)} className="mb-5 text-sm font-semibold uppercase tracking-widest text-accent">Aire acondicionado y ventilación mecánica</motion.p>
          <motion.h1 {...item(1)} className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Diseñamos el aire<br />que respira tu edificio.
          </motion.h1>
          <motion.p {...item(2)} className="mx-auto mt-6 max-w-2xl text-lg text-mute sm:text-xl">
            Cálculo, diseño y supervisión de sistemas de aire acondicionado y ventilación. No hacemos instalación: nos enfocamos en que todo esté bien pensado y bien vigilado.
          </motion.p>
          <motion.div {...item(3)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/cotizar" className="btn btn-lg">Solicitar cotización</Link>
            <Link href="/servicios" className="btn-ghost btn-lg">Ver servicios</Link>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
