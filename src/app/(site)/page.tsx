import Link from "next/link";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollServices } from "@/components/motion/ScrollServices";
import { ServiceScene } from "@/components/motion/ServiceScene";
import { Hero } from "@/components/site/Hero";

const STEPS = [
  ["01", "Entendemos tu espacio", "Nos cuentas qué necesitas y revisamos el uso, el tamaño y las condiciones del lugar."],
  ["02", "Calculamos y diseñamos", "Cargas térmicas, distribución de aire y ventilación, con memorias y especificaciones claras."],
  ["03", "Supervisamos", "Visitamos la obra, llevamos bitácora y damos seguimiento hasta cerrar cada observación."],
];

// Ejemplos ilustrativos (no son obras reales): muestran el tipo de entregable de cada servicio.
const PROJECTS = [
  { scene: "cargas", type: "Oficinas", title: "Edificio de oficinas", note: "Cargas térmicas por nivel y selección de equipos.", stat: "38 TR", statLabel: "carga estimada" },
  { scene: "ventilacion", type: "Estacionamiento", title: "Estacionamiento de dos sótanos", note: "Extracción mecánica por zonas y cálculo de caudales.", stat: "28,080 m³/h", statLabel: "por sótano" },
  { scene: "distribucion", type: "Plaza comercial", title: "Local en plaza comercial", note: "Conductos, rejillas y difusores bien dimensionados.", stat: "3 ramales", statLabel: "de distribución" },
  { scene: "supervision", type: "Bodega", title: "Bodega con obra en curso", note: "Visitas, bitácora y seguimiento de observaciones.", stat: "3 visitas", statLabel: "programadas" },
] as const;

const NUMBERS: [number, string][] = [
  [5, "servicios, de punta a punta"],
  [4, "tipos de espacio de ventilación"],
  [3, "documentos técnicos por proyecto"],
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="bg-surface py-16 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal><h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-6xl">Calculamos.</h2></Reveal>
          <Reveal delay={0.12}><h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-6xl">Diseñamos.</h2></Reveal>
          <Reveal delay={0.24}><h2 className="text-3xl font-semibold leading-tight tracking-tight text-accent sm:text-6xl">Supervisamos.</h2></Reveal>
          <Reveal delay={0.36}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-mute sm:mt-8 sm:text-lg">Nos enfocamos en lo que importa: que el sistema esté bien calculado, bien especificado y bien supervisado.</p>
          </Reveal>
        </div>
      </section>

      <ScrollServices />

      <section className="defer-render bg-gradient-to-b from-surface to-bg py-14 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3 sm:gap-10">
          {NUMBERS.map(([n, label], i) => (
            <Reveal key={label} delay={i * 0.08}>
              <div className="text-center">
                <div className="text-5xl font-semibold tracking-tight text-accent sm:text-7xl"><CountUp to={n} /></div>
                <p className="mx-auto mt-3 max-w-[14rem] text-sm text-mute">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="defer-render pb-14 pt-4 sm:pb-24 sm:pt-8">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-widest sm:text-sm text-accent">Ejemplos de proyecto</p>
            <h2 className="mb-3 mt-3 text-center text-3xl font-semibold tracking-tight sm:text-5xl">Lo que entregamos</h2>
            <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-mute sm:mb-12 sm:text-base">Así se ve el trabajo en distintos tipos de espacio. Son ejemplos ilustrativos con cifras de referencia.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROJECTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <article data-scene-host className="group h-full overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-28px_rgba(11,126,168,0.45)]">
                  <ServiceScene id={p.scene} mode="hover" className="h-32 rounded-none sm:h-40 border-0 border-b border-line" />
                  <div className="p-5 sm:p-6">
                    <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-accent">{p.type}</span>
                    <h3 className="mt-3 text-base font-semibold tracking-tight sm:text-lg">{p.title}</h3>
                    <p className="mt-2 text-sm text-mute">{p.note}</p>
                    <p className="mt-4 border-t border-line pt-4"><span className="text-xl font-semibold text-accent">{p.stat}</span> <span className="text-xs text-mute">{p.statLabel}</span></p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="defer-render py-16 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><h2 className="mb-8 text-center text-3xl sm:mb-12 font-semibold tracking-tight sm:text-5xl">Así trabajamos</h2></Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-line bg-surface p-6 transition sm:p-8 duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-28px_rgba(11,126,168,0.45)]">
                  <div className="text-sm font-semibold text-accent">{n}</div>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight sm:mt-3 sm:text-2xl">{t}</h3>
                  <p className="mt-2 text-sm text-mute sm:mt-3 sm:text-base">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="defer-render px-4 pb-16 sm:px-6 sm:pb-28">
        <Reveal>
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-accent-solid px-6 py-12 sm:px-8 sm:py-16 text-center text-white">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Cuéntanos tu proyecto.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white sm:mt-4 sm:text-base">Respóndenos unas preguntas sencillas y te contactamos por correo o teléfono, como prefieras.</p>
            <Link href="/cotizar" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm sm:mt-8 sm:px-7 sm:py-3.5 sm:text-base font-semibold text-accent-solid transition hover:scale-[1.03]">Solicitar cotización</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
