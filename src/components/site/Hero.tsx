"use client";

import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { Airflow } from "@/components/motion/Airflow";
import { EASE as ease } from "@/lib/motion";

const item = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay: 0.15 + i * 0.14, ease },
});

export function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative flex min-h-screen items-center overflow-hidden bg-surface">
        <div className="absolute inset-0 opacity-80"><Airflow /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface/0 via-surface/30 to-surface" aria-hidden />
        <div className="relative mx-auto w-full max-w-5xl px-6 pb-12 pt-24 text-center sm:pb-16 sm:pt-28">
          <motion.p {...item(0)} className="mb-4 text-xs font-semibold uppercase tracking-widest sm:mb-5 sm:text-sm text-accent">Aire acondicionado y ventilación mecánica</motion.p>
          <motion.h1 {...item(1)} className="text-3xl font-semibold leading-[1.1] tracking-tight min-[420px]:text-4xl sm:text-7xl">
            Diseñamos el aire<br />que respira tu edificio.
          </motion.h1>
          <motion.p {...item(2)} className="mx-auto mt-4 max-w-2xl text-base text-mute sm:mt-6 sm:text-xl">
            Cálculo, diseño y supervisión de sistemas de aire acondicionado y ventilación. Nos enfocamos en que todo esté bien pensado y bien vigilado.
          </motion.p>
          <motion.div {...item(3)} className="mt-7 flex flex-wrap sm:mt-9 items-center justify-center gap-3">
            <Link href="/cotizar" className="btn btn-lg">Solicitar cotización</Link>
            <Link href="/servicios" className="btn-ghost btn-lg">Ver servicios</Link>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
