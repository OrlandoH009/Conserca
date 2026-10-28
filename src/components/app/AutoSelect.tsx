"use client";

import { useState, useTransition } from "react";
import type { R } from "@/lib/action-utils";
import { Spinner } from "./SubmitButton";
import { toast } from "./Toaster";

/**
 * Lista desplegable que guarda sola al elegir (sin botón "Guardar"): muestra un indicador mientras guarda
 * y un aviso al terminar. Si el servidor rechaza el cambio, vuelve al valor anterior y explica por qué.
 * El padre debe pasar `key={value}` para que se actualice cuando cambian los datos del servidor.
 */
export function AutoSelect({
  name, value, options, action, fields = {}, label, okText = "Guardado", className = "input h-9 text-xs",
}: {
  name: string;
  value: string;
  options: [string, string][]; // [valor, texto]
  action: (fd: FormData) => Promise<R>;
  fields?: Record<string, string | number>; // campos ocultos que acompañan al valor (p. ej. el id)
  label: string;
  okText?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(value);
  const [pending, start] = useTransition();

  const change = (next: string) => {
    setCurrent(next);
    start(async () => {
      const fd = new FormData();
      fd.set(name, next);
      for (const [k, v] of Object.entries(fields)) fd.set(k, String(v));
      try {
        const r = await action(fd);
        if (r.error) { toast.error(r.error); setCurrent(value); } else toast.ok(okText);
      } catch {
        toast.error("No se pudo guardar. Intenta de nuevo.");
        setCurrent(value);
      }
    });
  };

  return (
    <span className="inline-flex items-center gap-2">
      <select className={className} value={current} onChange={(e) => change(e.target.value)} disabled={pending} aria-label={label} aria-busy={pending}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
      {pending && <Spinner className="h-4 w-4 text-accent" />}
    </span>
  );
}
