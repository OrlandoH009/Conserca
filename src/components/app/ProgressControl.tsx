"use client";

import { useState, useTransition } from "react";
import type { R } from "@/lib/action-utils";
import { Spinner } from "./SubmitButton";
import { toast } from "./Toaster";

/** Campo del avance (0–100) con su botón y, si la etapa sugiere otro valor, un atajo para usarlo. El padre pasa `key={value}`. */
export function ProgressControl({ projectId, value, suggested, action }: { projectId: number; value: number; suggested: number | null; action: (fd: FormData) => Promise<R> }) {
  const [text, setText] = useState(String(value));
  const [pending, start] = useTransition();

  const save = (n: string) =>
    start(async () => {
      const fd = new FormData();
      fd.set("id", String(projectId));
      fd.set("progress", n);
      try {
        const r = await action(fd);
        if (r.error) toast.error(r.error); else toast.ok("Avance actualizado");
      } catch {
        toast.error("No se pudo guardar. Intenta de nuevo.");
      }
    });

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); save(text); }} className="flex items-center gap-2">
        <input type="number" min={0} max={100} step={1} value={text} onChange={(e) => setText(e.target.value)} className="input w-24" aria-label="Porcentaje de avance" required />
        <button className="btn-ghost" disabled={pending} aria-busy={pending}>{pending && <Spinner />}Actualizar %</button>
      </form>
      {suggested !== null && suggested !== value && (
        <p className="mt-2 text-xs text-mute">
          Sugerido por la etapa: <button type="button" disabled={pending} onClick={() => { setText(String(suggested)); save(String(suggested)); }} className="font-semibold text-accent hover:underline">usar {suggested} %</button>
        </p>
      )}
    </div>
  );
}
