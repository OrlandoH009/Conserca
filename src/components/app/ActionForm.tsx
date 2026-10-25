"use client";

import { useActionState, useEffect, useRef } from "react";
import type { R } from "@/lib/action-utils";

/** Formulario que llama una acción del servidor, muestra el error y se limpia al guardar. */
export function ActionForm({
  action,
  children,
  submit = "Guardar",
  className = "",
  ghost = false,
}: {
  action: (prev: R, fd: FormData) => Promise<R>;
  children: React.ReactNode;
  submit?: string;
  className?: string;
  ghost?: boolean;
}) {
  const [state, run, pending] = useActionState<R, FormData>(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={run} className={className}>
      {children}
      <div className="mt-4 flex items-center gap-3">
        <button className={ghost ? "btn-ghost" : "btn"} disabled={pending}>{pending ? "Guardando…" : submit}</button>
        {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      </div>
    </form>
  );
}

export function F({ label, name, type = "text", placeholder, defaultValue, required = true, step, children }: {
  label: string; name: string; type?: string; placeholder?: string; defaultValue?: string | number; required?: boolean; step?: string; children?: React.ReactNode;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      {children ?? <input id={name} name={name} type={type} step={step} className="input" placeholder={placeholder} defaultValue={defaultValue} required={required} />}
    </div>
  );
}
