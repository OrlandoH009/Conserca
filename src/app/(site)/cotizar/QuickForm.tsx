"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useT } from "@/components/site/LocaleProvider";
import { ResetButton } from "@/components/app/ConfirmButton";
import { DETAIL_MAX } from "@/lib/quote-options";
import { submitQuick, type QuoteState } from "./actions";

/** Cotización básica sin cuenta: nombre, teléfono y una descripción en prosa. */
export function QuickForm() {
  const t = useT();
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuick, {});
  const [len, setLen] = useState(0);
  const err = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (state.error) err.current?.scrollIntoView({ block: "center" }); }, [state]);

  if (state.ok)
    return (
      <div className="rounded-3xl border border-line bg-surface p-6 text-center sm:p-10">
        <div className="mx-auto flex h-14 w-14 animate-[pop_.5s_cubic-bezier(.34,1.56,.64,1)_both] items-center justify-center rounded-full bg-soft text-2xl text-accent">✓</div>
        <h2 className="mt-4 text-xl font-semibold sm:mt-5 sm:text-2xl tracking-tight">{t("¡Gracias! Recibimos tu solicitud.")}</h2>
        <p className="mt-2 text-mute">{t("Te llamaremos o escribiremos por WhatsApp al teléfono que nos dejaste.")}</p>
      </div>
    );

  return (
    // onSubmit en vez de action={...}: así React no vacía el formulario cuando el servidor devuelve un error.
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} onReset={() => setLen(0)} className="rounded-3xl border border-line bg-surface p-5 sm:p-8 md:p-10">
      <h2 className="text-xl font-semibold tracking-tight">{t("Cotización rápida")}</h2>
      <p className="mt-1 text-sm text-mute">{t("Sin cuenta: cuéntanos qué necesitas y te contactamos.")}</p>
      <p className="mb-6 mt-1 text-xs text-mute">{t("Los campos con * son obligatorios")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="q-name">{t("Nombre")}</label>
          <input id="q-name" name="name" className="input" autoComplete="name" required minLength={2} maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="q-phone">{t("Teléfono o WhatsApp")}</label>
          <input id="q-phone" name="phone" type="tel" className="input" autoComplete="tel" required maxLength={40} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="q-message">{t("¿Qué necesitas?")}</label>
          <textarea id="q-message" name="message" className="input" required minLength={10} maxLength={DETAIL_MAX} aria-describedby="q-count" onChange={(e) => setLen(e.target.value.length)} placeholder={t("Tipo de espacio, tamaño aproximado, qué servicio buscas y para cuándo…")} />
          <p id="q-count" className="mt-1 text-right text-xs text-mute">{len}/{DETAIL_MAX}</p>
        </div>
      </div>
      {/* Campo trampa: las personas no lo ven; los bots lo llenan. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px]" />
      {state.error && <p ref={err} role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{t(state.error)}</p>}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <button className="btn btn-lg w-full md:w-auto md:px-14" disabled={pending}>{pending ? t("Enviando…") : t("Enviar solicitud")}</button>
        <ResetButton className="btn-ghost btn-line w-full md:w-auto" />
      </div>
      <p className="mt-4 text-xs text-mute">{t("Al enviar aceptas que usemos estos datos para contactarte sobre tu cotización, según nuestros")} <a href="/terminos" target="_blank" className="font-semibold text-accent hover:underline">{t("Términos y condiciones")}</a> {t("y")} <a href="/privacidad" target="_blank" className="font-semibold text-accent hover:underline">{t("Aviso de privacidad")}</a>.</p>
    </form>
  );
}
