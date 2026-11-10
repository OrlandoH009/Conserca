"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/site/LocaleProvider";

/**
 * Ventana de confirmación propia (en lugar de window.confirm). `ask(mensaje)` la abre y resuelve true/false;
 * `dialog` se dibuja junto al botón. Esc, "Cancelar" o clic en el fondo cuentan como "no".
 */
export function useConfirm() {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const resolve = useRef<((ok: boolean) => void) | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { if (message) ref.current?.showModal(); }, [message]);

  const ask = (m: string) => new Promise<boolean>((res) => { resolve.current = res; setMessage(m); });
  const finish = (ok: boolean) => { resolve.current?.(ok); resolve.current = null; ref.current?.close(); };

  const dialog = (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-label={message ?? undefined}
      onClose={() => { resolve.current?.(false); resolve.current = null; setMessage(null); }}
      onClick={(e) => { if (e.target === ref.current) finish(false); }} // clic en el fondo
      className="edit-dialog m-auto w-[min(92vw,26rem)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      {message && (
        <div className="p-6">
          <div className="flex gap-4">
            <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/10 text-lg font-bold text-red-600">!</span>
            <p className="pt-2 text-[15px] leading-relaxed">{message}</p>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" autoFocus onClick={() => finish(false)} className="btn-ghost btn-line">{t("Cancelar")}</button>
            <button type="button" onClick={() => finish(true)} className="btn bg-red-600 hover:shadow-red-600/30">{t("Confirmar")}</button>
          </div>
        </div>
      )}
    </dialog>
  );

  return { ask, dialog };
}

/** Botón de formulario que pide confirmación antes de enviar (para acciones que no se pueden deshacer). */
export function ConfirmButton({ message, className = "", children }: { message: string; className?: string; children: React.ReactNode }) {
  const { ask, dialog } = useConfirm();
  return (
    <>
      <button
        className={className}
        onClick={async (e) => {
          e.preventDefault();
          const btn = e.currentTarget; // se guarda antes de esperar: React no conserva el evento
          if (await ask(message)) btn.form?.requestSubmit(btn);
        }}
      >
        {children}
      </button>
      {dialog}
    </>
  );
}
