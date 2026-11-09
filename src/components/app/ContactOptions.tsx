"use client";

import { useT } from "@/components/site/LocaleProvider";
import type { R } from "@/lib/action-utils";
import { useDialogClose } from "./EditDialog";

/** Opciones de Contactar: abren WhatsApp o el correo de la persona y dejan la solicitud "En proceso". */
export function ContactOptions({ id, whatsapp, email, action }: { id: number; whatsapp: string | null; email: string | null; action: (fd: FormData) => Promise<R> }) {
  const t = useT();
  const close = useDialogClose();
  const mark = () => {
    const fd = new FormData();
    fd.set("id", String(id));
    void action(fd);
    close?.();
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={mark} className="btn">{t("WhatsApp")}</a>}
      {email && <a href={email} onClick={mark} className="btn-ghost">{t("Correo")}</a>}
    </div>
  );
}
