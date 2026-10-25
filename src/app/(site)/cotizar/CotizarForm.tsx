"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useActionState, useState } from "react";
import { DETAIL_MAX, SIZES, SPACE_TYPES, STAGES, WHEN } from "@/lib/quote-options";
import { SERVICES } from "@/lib/services";
import { submitQuote, type QuoteState } from "./actions";

type User = { name: string; email: string; phone: string | null };
const ease = [0.22, 1, 0.36, 1] as const;

/** Opción tipo botón: es un radio o un checkbox de verdad, solo que con aspecto de etiqueta. */
function Chip({ type, name, value }: { type: "radio" | "checkbox"; name: string; value: string }) {
  return (
    <label className="cursor-pointer">
      <input type={type} name={name} value={value} className="peer sr-only" />
      <span className="block rounded-xl border-[1.5px] border-line px-4 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 peer-checked:border-accent peer-checked:bg-soft peer-checked:font-semibold peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">{value}</span>
    </label>
  );
}

function Step({ n, title, hint, wide, children }: { n: number; title: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <motion.fieldset className={wide ? "md:col-span-2" : ""} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, ease }}>
      <legend className="mb-3 flex items-center gap-3 font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm text-white">{n}</span>
        {title}
        {hint && <span className="text-sm font-normal text-mute">{hint}</span>}
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
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-line bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-soft text-2xl text-accent">✓</div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">¡Gracias! Recibimos tu solicitud.</h2>
        <p className="mt-2 text-mute">Te contactaremos pronto al {user.phone ?? user.email}.</p>
      </motion.div>
    );

  return (
    <MotionConfig reducedMotion="user">
      <form action={action} className="rounded-3xl border border-line bg-white p-8 md:p-10">
        <div className="mb-8 rounded-xl bg-soft px-4 py-3 text-sm">
          <p className="font-semibold text-accent">{user.name}</p>
          <p className="text-mute">{[user.phone, user.email].filter(Boolean).join(" · ")}</p>
          <p className="mt-1 text-xs text-mute">Te respondemos a estos datos de tu cuenta.</p>
        </div>

        <div className="grid gap-x-12 gap-y-9 md:grid-cols-2">
        <Step n={1} wide title="¿Qué tipo de espacio es?">{SPACE_TYPES.map((v) => <Chip key={v} type="radio" name="space" value={v} />)}</Step>
        <Step n={2} wide title="¿Qué necesitas de nosotros?" hint="(puedes elegir varios)">{SERVICES.map((s) => <Chip key={s.id} type="checkbox" name="services" value={s.title} />)}</Step>
        <Step n={3} title="¿De qué tamaño es, más o menos?">{SIZES.map((v) => <Chip key={v} type="radio" name="size" value={v} />)}</Step>
        <Step n={4} title="¿En qué etapa va tu proyecto?">{STAGES.map((v) => <Chip key={v} type="radio" name="stage" value={v} />)}</Step>
        <Step n={5} title="¿Para cuándo lo necesitas?">{WHEN.map((v) => <Chip key={v} type="radio" name="when" value={v} />)}</Step>

        <div className="self-end">
          <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-accent transition hover:underline">
            <span className={`inline-block transition-transform duration-300 ${more ? "rotate-45" : ""}`}>+</span> Agregar más detalle <span className="font-normal text-mute">(opcional)</span>
          </button>
          <AnimatePresence initial={false}>
            {more && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
                <textarea name="detail" maxLength={DETAIL_MAX} className="input mt-3" placeholder="Ubicación, medidas, equipos que ya tienes, cualquier dato que ayude…" />
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
