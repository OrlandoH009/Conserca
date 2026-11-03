"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/site/LocaleProvider";
import { ServiceTile } from "@/components/site/ServiceIcon";
import { MobileServices } from "./MobileServices";
import { ServiceScene } from "./ServiceScene";
import { SERVICES } from "@/lib/services";

/** "Lo que hacemos" en escritorio: se cambia de servicio solo con clic (sin efecto de scroll). */
export function ScrollServices() {
  const t = useT();
  const [i, setI] = useState(0);
  const s = SERVICES[i];

  return (
    <>
    <section className="relative hidden md:block" aria-label={t("Servicios")}>
      <div className="relative flex min-h-screen items-center overflow-hidden py-20">
        <div aria-hidden className="absolute inset-0 bg-surface" />
        <div aria-hidden className="absolute inset-0 bg-soft opacity-60" />
        <div aria-hidden className="absolute -left-40 top-0 h-[34rem] w-[34rem] rounded-full bg-accent/25 blur-3xl" />
        <div aria-hidden className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-300/30 blur-3xl" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)", backgroundSize: "56px 56px" }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-surface to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-surface to-transparent" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">{t("Lo que hacemos")}</p>
            <ul className="space-y-2.5">
              {SERVICES.map((x, n) => (
                <li key={x.id}>
                  <button
                    onClick={() => setI(n)}
                    aria-current={n === i ? "true" : undefined}
                    className={`flex cursor-pointer items-center gap-4 text-left text-lg font-semibold tracking-tight transition-colors duration-300 md:text-xl ${n === i ? "text-accent" : "text-mute hover:text-ink"}`}
                  >
                    <ServiceTile id={x.id} active={n === i} size="h-14 w-14" icon="h-9 w-9" />
                    {t(x.title)}
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/cotizar" className="pulse-ring group relative mt-10 inline-flex items-center gap-3 rounded-full bg-accent-solid px-8 py-4 text-lg font-bold text-white shadow-[0_14px_34px_-10px_rgba(11,126,168,0.8)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_20px_40px_-10px_rgba(11,126,168,0.9)] active:scale-[.98]">
                            {t("Cotizar mi proyecto")}
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
                className="rounded-3xl border border-line bg-surface p-8 shadow-[0_20px_60px_-30px_rgba(11,126,168,0.35)]"
              >
                <ServiceScene id={s.id} className="mb-6 h-44" />
                <div className="mb-3 flex items-center gap-3 text-accent">
                  <ServiceTile id={s.id} active size="h-20 w-20" icon="h-13 w-13" />
                  <span className="text-sm font-semibold uppercase tracking-wide">{t(s.title)}</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{t(s.short)}</h3>
                <ul className="mt-4 space-y-2 text-mute">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{t(p)}</li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
    <MobileServices />
    </>
  );
}
