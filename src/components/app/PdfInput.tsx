"use client";

import { useState } from "react";
import { useT } from "@/components/site/LocaleProvider";
import { fmtMB, PDF_MAX } from "@/lib/pdf";

/** Selector de PDF que avisa antes de enviar: un archivo demasiado grande ni siquiera llegaría al servidor. */
export function PdfInput({ name = "file" }: { name?: string }) {
  const t = useT();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div>
      <input
        id={name}
        name={name}
        type="file"
        accept="application/pdf"
        className="input pt-2.5"
        aria-describedby={`${name}-hint`}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (!f) return setMsg(null);
          const bad = f.size > PDF_MAX ? t("Ese archivo pesa {size} y el máximo es {max}. Comprímelo o elige otro.", { size: fmtMB(f.size), max: fmtMB(PDF_MAX) }) : f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf") ? t("Solo se pueden subir archivos PDF.") : null;
          if (bad) { e.currentTarget.value = ""; return setMsg({ ok: false, text: bad }); }
          setMsg({ ok: true, text: t("Listo: {name} ({size})", { name: f.name, size: fmtMB(f.size) }) });
        }}
      />
      <p id={`${name}-hint`} role={msg && !msg.ok ? "alert" : undefined} className={`mt-1.5 text-xs ${msg ? (msg.ok ? "text-accent" : "font-semibold text-red-700") : "text-mute"}`}>
        {msg?.text ?? t("Solo PDF, de hasta {max}.", { max: fmtMB(PDF_MAX) })}
      </p>
    </div>
  );
}
