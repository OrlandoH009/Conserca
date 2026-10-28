"use client";

import Link from "next/link";
import { ServiceTile } from "@/components/site/ServiceIcon";
import { SERVICES } from "@/lib/services";
import { Reveal } from "./Reveal";
import { ServiceScene } from "./ServiceScene";

/** "Lo que hacemos" en celular: tarjetas que aparecen una a una al bajar, sin el efecto de scroll fijo del escritorio. */
export function MobileServices() {
  return (
    <section className="px-4 py-10 md:hidden" aria-label="Servicios">
      <Reveal>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Lo que hacemos</p>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Todo, de principio a fin</h2>
      </Reveal>
      <div className="space-y-5">
        {SERVICES.map((s, i) => (
          <Reveal key={s.id} delay={0.05} y={36}>
            <article className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_20px_50px_-32px_rgba(11,126,168,0.5)]">
              <ServiceScene id={s.id} className="h-36 rounded-none border-0 border-b border-line" />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <ServiceTile id={s.id} size="h-11 w-11" icon="h-7 w-7" active={i === 0} />
                  <h3 className="text-base font-semibold leading-tight tracking-tight">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm text-mute">{s.short}</p>
                <ul className="mt-3 space-y-1.5 text-[13px]">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{p}</li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <Link href="/cotizar" className="btn btn-lg mt-8 w-full">Cotizar mi proyecto</Link>
      </Reveal>
    </section>
  );
}
