import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceTile } from "@/components/site/ServiceIcon";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = { title: "Servicios" };

export default function Servicios() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-28 pt-32">
      <Reveal>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Nuestros servicios</h1>
        <p className="mt-4 max-w-2xl text-lg text-mute">Todo lo que hacemos por tu proyecto, de principio a fin. Diseñamos y supervisamos; no realizamos la instalación.</p>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {SERVICES.map((s, i) => (
          <Reveal key={s.id} delay={(i % 2) * 0.08}>
            <article className="h-full rounded-3xl border border-line bg-white p-8 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-28px_rgba(11,126,168,0.45)]">
              <ServiceTile id={s.id} size="h-16 w-16" icon="h-11 w-11" />
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">{s.title}</h2>
              <p className="mt-2 text-mute">{s.short}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{p}</li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
        <Reveal delay={0.08}>
          <article className="flex h-full flex-col justify-between rounded-3xl bg-accent p-8 text-white">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">¿Tienes un proyecto?</h2>
              <p className="mt-2 text-white/85">Cuéntanos qué necesitas y te decimos cómo ayudarte.</p>
            </div>
            <Link href="/cotizar" className="mt-8 inline-flex w-fit rounded-full bg-white px-6 py-3 font-semibold text-accent transition hover:scale-[1.03]">Solicitar cotización</Link>
          </article>
        </Reveal>
      </div>
      <Link href="/cotizar" className="group fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-accent to-cyan-500 px-8 py-4 text-lg font-bold text-white shadow-[0_16px_40px_-10px_rgba(11,126,168,0.9)] transition duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"><span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/30 [animation-duration:2.5s]" />Cotizar mi proyecto<svg viewBox="0 0 20 20" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h12M11 5l5 5-5 5" /></svg></Link>
    </div>
  );
}
