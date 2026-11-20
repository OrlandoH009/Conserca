"use client";

import { useT } from "@/components/site/LocaleProvider";
import { useState, useTransition } from "react";
import type { R } from "@/lib/action-utils";
import { Spinner } from "./SubmitButton";
import { toast } from "./Toaster";

/** El avance se pone solo al cambiar de etapa; esto es el ajuste manual (0–100) por si una etapa va a la mitad. El padre pasa `key={value}`. */
export function ProgressControl({ projectId, value, action }: { projectId: number; value: number; action: (fd: FormData) => Promise<R> }) {
  const t = useT();
  const [text, setText] = useState(String(value));
  const [pending, start] = useTransition();

  const save = (n: string) =>
    start(async () => {
      const fd = new FormData();
      fd.set("id", String(projectId));
      fd.set("progress", n);
      try {
        const r = await action(fd);
        if (r.error) toast.error(t(r.error)); else toast.ok(t("Avance actualizado"));
      } catch {
        toast.error(t("No se pudo guardar. Intenta de nuevo."));
      }
    });

  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-xs text-mute hover:text-accent">{t("Se calcula solo por la etapa · Ajustar a mano")}</summary>
      <form onSubmit={(e) => { e.preventDefault(); save(text); }} className="mt-2 flex items-center gap-2">
        <input type="number" min={0} max={100} step={1} value={text} onChange={(e) => setText(e.target.value)} className="input w-24" aria-label={t("Porcentaje de avance")} required />
        <button className="btn-ghost" disabled={pending} aria-busy={pending}>{pending && <Spinner />}{t("Actualizar %")}</button>
      </form>
    </details>
  );
}
