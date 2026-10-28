"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import type { R } from "@/lib/action-utils";
import { useDialogClose } from "./EditDialog";
import { Spinner } from "./SubmitButton";
import { toast } from "./Toaster";

/** Formulario que llama una acción del servidor, muestra el error y se limpia al guardar. */
export function ActionForm({
  action,
  children,
  submit = "Guardar",
  className = "",
  ghost = false,
  success = "Guardado",
}: {
  action: (prev: R, fd: FormData) => Promise<R>;
  children: React.ReactNode;
  submit?: string;
  className?: string;
  ghost?: boolean;
  success?: string;
}) {
  const [state, run, pending] = useActionState<R, FormData>(action, {});
  const ref = useRef<HTMLFormElement>(null);
  const closeDialog = useDialogClose(); // dentro de una ventana de edición, se cierra al guardar
  useEffect(() => { if (state.ok) { ref.current?.reset(); toast.ok(success); closeDialog?.(); } }, [state, success, closeDialog]);
  return (
    <form ref={ref} action={run} className={className}>
      {children}
      <div className="mt-4 flex items-center gap-3">
        <button className={ghost ? "btn-ghost" : "btn"} disabled={pending}>{pending ? <><Spinner /> Guardando…</> : submit}</button>
        {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      </div>
    </form>
  );
}

export function F({ label, name, type = "text", placeholder, defaultValue, required = true, step, children }: {
  label: string; name: string; type?: string; placeholder?: string; defaultValue?: string | number; required?: boolean; step?: string; children?: React.ReactNode;
}) {
  const uid = useId();
  const fid = `${uid}${name}`;
  return (
    <div>
      <label className="label" htmlFor={children ? name : fid}>{label}</label>
      {children ?? <input id={fid} name={name} type={type} step={step} className="input" placeholder={placeholder} defaultValue={defaultValue} required={required} />}
    </div>
  );
}
