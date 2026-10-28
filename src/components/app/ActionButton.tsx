"use client";

import { useTransition } from "react";
import type { R } from "@/lib/action-utils";
import { Spinner } from "./SubmitButton";
import { toast } from "./Toaster";

/**
 * Botón que ejecuta una acción del servidor sin recargar: pide confirmación si se le indica, muestra un indicador
 * mientras trabaja y avisa del resultado (o del motivo si no se pudo). Sustituye al formulario + botón de "Quitar", "Eliminar", etc.
 */
export function ActionButton({
  action, fields = {}, confirm, okText = "Listo", className = "", children,
}: {
  action: (fd: FormData) => Promise<R>;
  fields?: Record<string, string | number>;
  confirm?: string;
  okText?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  const click = () => {
    if (confirm && !window.confirm(confirm)) return;
    start(async () => {
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields)) fd.set(k, String(v));
      try {
        const r = await action(fd);
        if (r.error) toast.error(r.error); else toast.ok(okText);
      } catch {
        toast.error("No se pudo completar. Intenta de nuevo.");
      }
    });
  };
  return (
    <button type="button" onClick={click} disabled={pending} aria-busy={pending} className={`inline-flex items-center gap-1.5 disabled:opacity-60 ${className}`}>
      {pending && <Spinner className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}
