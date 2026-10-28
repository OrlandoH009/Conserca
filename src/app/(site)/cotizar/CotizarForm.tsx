"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useActionState, useState } from "react";
import { CONTACTS, DETAIL_MAX, PLANS, SIZES, SPACE_TYPES, STAGES, TIMES, WHEN } from "@/lib/quote-options";
import { SERVICES } from "@/lib/services";
import { submitQuote, type QuoteState } from "./actions";
import { EASE as ease } from "@/lib/motion";

type User = { name: string; email: string; phone: string | null };

/** Opción tipo botón: es un radio o un checkbox de verdad, solo que con aspecto de etiqueta. */
function Chip({ type, name, value, defaultChecked }: { type: "radio" | "checkbox"; name: string; value: string; defaultChecked?: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type={type} name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="block rounded-xl border-[1.5px] border-field px-4 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 peer-checked:animate-[pop_.35s_cubic-bezier(.34,1.56,.64,1)] peer-checked:border-accent peer-checked:bg-soft peer-checked:font-semibold peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">{value}</span>
    </label>
  );
}

/** Grupo de preguntas con un título pequeño y una línea arriba, para separar bien los bloques. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-6 border-b border-line pb-3 text-xs font-semibold uppercase tracking-widest text-accent">{title}</h3>
      <div className="space-y-9">{children}</div>
    </section>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <motion.fieldset initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, ease }}>
      <legend className="mb-4 flex items-center gap-3 font-semibold">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-solid text-sm text-white">{n}</span>
        <span>{title}{hint && <span className="ml-2 text-sm font-normal text-mute">{hint}</span>}</span>
      </legend>
      <div className="flex flex-wrap gap-3">{children}</div>
    </motion.fieldset>
  );
}

export function CotizarForm({ user }: { user: User }) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuote, {});
  const [more, setMore] = useState(false);

  if (state.ok)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-line bg-surface p-6 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 animate-[pop_.5s_cubic-bezier(.34,1.56,.64,1)_both] items-center justify-center rounded-full bg-soft text-2xl text-accent">✓</div>
        <h2 className="mt-4 text-xl font-semibold sm:mt-5 sm:text-2xl tracking-tight">¡Gracias! Recibimos tu solicitud.</h2>
        <p className="mt-2 text-mute">Te contactaremos pronto como nos indicaste. Mientras tanto, cuando el equipo inicie tu proyecto podrás seguir su avance en <a href="/mis-proyectos" className="font-semibold text-accent hover:underline">Mis proyectos</a>.</p>
      </motion.div>
    );

  return (
    <MotionConfig reducedMotion="user">
      <form action={action} className="rounded-3xl border border-line bg-surface p-5 sm:p-8 md:p-10">
        <div className="mb-10 rounded-xl bg-soft px-4 py-3 text-sm">
          <p className="font-semibold text-accent">{user.name}</p>
          <p className="text-mute">{[user.phone, user.email].filter(Boolean).join(" · ")}</p>
          <p className="mt-1 text-xs text-mute">Te respondemos a estos datos de tu cuenta.</p>
        </div>

        <div className="space-y-14">
          <Group title="Tu proyecto">
            <Step n={1} title="¿Qué tipo de espacio es?">{SPACE_TYPES.map((v) => <Chip key={v} type="radio" name="space" value={v} />)}</Step>
            <Step n={2} title="¿De qué tamaño es, más o menos?">{SIZES.map((v) => <Chip key={v} type="radio" name="size" value={v} />)}</Step>
            <Step n={3} title="¿Dónde está el proyecto?" hint="(opcional)">
              <input id="location" name="location" maxLength={150} className="input max-w-md" placeholder="Ciudad, colonia o zona" />
            </Step>
          </Group>

          <Group title="Qué necesitas">
            <Step n={4} title="¿Qué necesitas de nosotros?" hint="(puedes elegir varios)">{SERVICES.map((s) => <Chip key={s.id} type="checkbox" name="services" value={s.title} />)}</Step>
            <Step n={5} title="¿En qué etapa va tu proyecto?">{STAGES.map((v) => <Chip key={v} type="radio" name="stage" value={v} />)}</Step>
            <Step n={6} title="¿Para cuándo lo necesitas?">{WHEN.map((v) => <Chip key={v} type="radio" name="when" value={v} />)}</Step>
            <Step n={7} title="¿Ya tienes planos del lugar?">{PLANS.map((v) => <Chip key={v} type="radio" name="plans" value={v} />)}</Step>
          </Group>

          <Group title="Cómo te contactamos">
            <Step n={8} title="¿Cómo prefieres que te contactemos?">
              {CONTACTS.map((v, i) => (user.phone || i > 0) && <Chip key={v} type="radio" name="contact" value={v} defaultChecked={user.phone ? i === 0 : i === 1} />)}
            </Step>
            <Step n={9} title="¿En qué horario?">{TIMES.map((v) => <Chip key={v} type="radio" name="time" value={v} />)}</Step>
          </Group>

          <div>
            <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-accent transition hover:underline">
              <span className={`inline-block transition-transform duration-300 ${more ? "rotate-45" : ""}`}>+</span> Agregar más detalle <span className="font-normal text-mute">(opcional)</span>
            </button>
            <AnimatePresence initial={false}>
              {more && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
                  <textarea name="detail" maxLength={DETAIL_MAX} className="input mt-3" placeholder="Medidas, equipos que ya tienes, cualquier dato que ayude…" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {state.error && <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}
        <button className="btn btn-lg mt-8 w-full md:w-auto md:px-14" disabled={pending}>{pending ? "Enviando…" : "Enviar solicitud"}</button>
      </form>
    </MotionConfig>
  );
}
