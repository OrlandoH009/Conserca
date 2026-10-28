"use client";

import { useActionState } from "react";
import { submitQuick, type QuoteState } from "./actions";

/** Cotización básica sin cuenta: nombre, teléfono y una descripción en prosa. */
export function QuickForm() {
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuick, {});

  if (state.ok)
    return (
      <div className="rounded-3xl border border-line bg-surface p-6 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 animate-[pop_.5s_cubic-bezier(.34,1.56,.64,1)_both] items-center justify-center rounded-full bg-soft text-2xl text-accent">✓</div>
        <h2 className="mt-4 text-xl font-semibold sm:mt-5 sm:text-2xl tracking-tight">¡Gracias! Recibimos tu solicitud.</h2>
        <p className="mt-2 text-mute">Te llamaremos o escribiremos por WhatsApp al teléfono que nos dejaste.</p>
      </div>
    );

  return (
    <form action={action} className="rounded-3xl border border-line bg-surface p-5 sm:p-8 md:p-10">
      <h2 className="text-xl font-semibold tracking-tight">Cotización rápida</h2>
      <p className="mb-6 mt-1 text-sm text-mute">Sin cuenta: cuéntanos qué necesitas y te contactamos.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="q-name">Nombre</label>
          <input id="q-name" name="name" className="input" autoComplete="name" required minLength={2} maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="q-phone">Teléfono o WhatsApp</label>
          <input id="q-phone" name="phone" type="tel" className="input" autoComplete="tel" required maxLength={40} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="q-message">¿Qué necesitas?</label>
          <textarea id="q-message" name="message" className="input" required minLength={10} maxLength={1500} placeholder="Tipo de espacio, tamaño aproximado, qué servicio buscas y para cuándo…" />
        </div>
      </div>
      {/* Campo trampa: las personas no lo ven; los bots lo llenan. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px]" />
      {state.error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}
      <button className="btn btn-lg mt-6 w-full md:w-auto md:px-14" disabled={pending}>{pending ? "Enviando…" : "Enviar solicitud"}</button>
      <p className="mt-4 text-xs text-mute">Al enviar aceptas que usemos estos datos para contactarte sobre tu cotización, según nuestros <a href="/terminos" target="_blank" className="font-semibold text-accent hover:underline">Términos y condiciones</a> y <a href="/privacidad" target="_blank" className="font-semibold text-accent hover:underline">Aviso de privacidad</a>.</p>
    </form>
  );
}
