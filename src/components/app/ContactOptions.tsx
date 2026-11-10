"use client";

import { useRef } from "react";
import { useT } from "@/components/site/LocaleProvider";
import type { R } from "@/lib/action-utils";
import { toast } from "./Toaster";

/** Datos de contacto con botón para copiarlos; quien atiende escribe por la aplicación que prefiera. Al copiar, la solicitud pasa a "En proceso". */
export function ContactOptions({ id, phone, email, action }: { id: number; phone: string | null; email: string | null; action: (fd: FormData) => Promise<R> }) {
  const t = useT();
  const marked = useRef(false);
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.ok(t("Copiado"));
    } catch {
      return toast.error(t("No se pudo copiar. Selecciónalo y cópialo a mano.")); // sin HTTPS el navegador no deja copiar
    }
    if (marked.current) return;
    marked.current = true;
    const fd = new FormData();
    fd.set("id", String(id));
    void action(fd);
  };
  const rows = [[t("Teléfono"), phone], [t("Correo"), email]].filter((r): r is [string, string] => !!r[1]);
  return (
    <div className="space-y-3">
      <p className="text-sm text-mute">{t("Copia el dato y escríbele por la aplicación que prefieras.")}</p>
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-mute">{label}</p>
            <p className="select-all truncate font-medium">{value}</p>
          </div>
          <button type="button" onClick={() => copy(value)} className="btn-ghost shrink-0 px-3 py-1.5 text-xs" aria-label={`${t("Copiar")}: ${label}`}>{t("Copiar")}</button>
        </div>
      ))}
    </div>
  );
}
