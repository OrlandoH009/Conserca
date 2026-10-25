import Link from "next/link";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollServices } from "@/components/motion/ScrollServices";
import { Hero } from "@/components/site/Hero";

const STEPS = [
  ["01", "Entendemos tu espacio", "Nos cuentas qué necesitas y revisamos el uso, el tamaño y las condiciones del lugar."],
  ["02", "Calculamos y diseñamos", "Cargas térmicas, distribución de aire y ventilación, con memorias y especificaciones claras."],
  ["03", "Supervisamos", "Visitamos la obra, llevamos bitácora y damos seguimiento hasta cerrar cada observación."],
];

const NUMBERS: [number, string][] = [
  [5, "servicios, de punta a punta"],
  [4, "tipos de espacio de ventilación"],
  [3, "documentos técnicos por proyecto"],
  [0, "instalaciones: diseñamos y supervisamos"],
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="bg-white py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal><h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Diseñamos.</h2></Reveal>
          <Reveal delay={0.12}><h2 className="text-4xl font-semibold leading-tight tracking-tight text-accent sm:text-6xl">Supervisamos.</h2></Reveal>
          <Reveal delay={0.24}><h2 className="text-4xl font-semibold leading-tight tracking-tight text-ink/30 sm:text-6xl">No instalamos.</h2></Reveal>
          <Reveal delay={0.36}>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-mute">Esa claridad nos permite enfocarnos en lo que importa: que el sistema esté bien calculado, bien especificado y bien supervisado.</p>
          </Reveal>
        </div>
      </section>

      <ScrollServices />

      <section className="bg-gradient-to-b from-white to-bg py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map(([n, label], i) => (
            <Reveal key={label} delay={i * 0.08}>
              <div className="text-center">
                <div className="text-6xl font-semibold tracking-tight text-accent sm:text-7xl"><CountUp to={n} /></div>
                <p className="mx-auto mt-3 max-w-[14rem] text-sm text-mute">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><h2 className="mb-12 text-center text-4xl font-semibold tracking-tight sm:text-5xl">Así trabajamos</h2></Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-line bg-white p-8 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-28px_rgba(11,126,168,0.45)]">
                  <div className="text-sm font-semibold text-accent">{n}</div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">{t}</h3>
                  <p className="mt-3 text-mute">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28">
        <Reveal>
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-accent px-8 py-16 text-center text-white">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Cuéntanos tu proyecto.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">Respóndenos unas preguntas sencillas y te contactamos por correo o teléfono, como prefieras.</p>
            <Link href="/cotizar" className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 font-semibold text-accent transition hover:scale-[1.03]">Solicitar cotización</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
