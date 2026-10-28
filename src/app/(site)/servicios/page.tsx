import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceTile } from "@/components/site/ServiceIcon";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = { title: "Servicios" };

// Tamaños de texto estándar del sitio. En pantallas grandes el contenido busca ocupar el alto de la ventana
// (el pie queda debajo); si la ventana es baja, la página baja un poco en vez de encoger o recortar el texto.
export default function Servicios() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:min-h-svh lg:pb-20 lg:pt-20">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-6xl">Nuestros servicios</h1>
        <p className="mt-2 max-w-2xl text-base text-mute sm:mt-3 sm:text-lg">Todo lo que hacemos por tu proyecto, de principio a fin.</p>
      </Reveal>
      {/* 5 servicios: 3 en la primera fila y 2 más anchos en la segunda, sin hueco al final. */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:flex-1 lg:grid-cols-6 lg:grid-rows-2">
        {SERVICES.map((s, i) => (
          <Reveal key={s.id} delay={(i % 3) * 0.08} className={`h-full ${i < 3 ? "lg:col-span-2" : i === SERVICES.length - 1 && SERVICES.length % 2 ? "md:col-span-2 lg:col-span-3" : "lg:col-span-3"}`}>
            <article className="h-full rounded-3xl border border-line bg-surface p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-28px_rgba(11,126,168,0.45)]">
              <ServiceTile id={s.id} size="h-12 w-12 sm:h-14 sm:w-14" icon="h-10 w-10" />
              <h2 className="mt-4 text-xl font-semibold tracking-tight">{s.title}</h2>
              <p className="mt-2 text-sm text-mute">{s.short}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{p}</li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
      <Link href="/cotizar" className="pulse-ring group fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-solid to-accent-solid-2 px-5 py-3 text-sm sm:bottom-6 sm:right-6 sm:gap-2.5 sm:px-8 sm:py-4 sm:text-lg font-bold text-white shadow-[0_16px_40px_-10px_rgba(11,126,168,0.9)] transition duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95">Cotizar mi proyecto<svg viewBox="0 0 20 20" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h12M11 5l5 5-5 5" /></svg></Link>
    </div>
  );
}
