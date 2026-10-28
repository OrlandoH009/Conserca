"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const CloseContext = createContext<(() => void) | null>(null);
/** Dentro de una ventana de edición devuelve la función para cerrarla (los formularios la llaman al guardar). */
export const useDialogClose = () => useContext(CloseContext);

/**
 * Botón + ventana (<dialog> nativo: atrapa el foco, se cierra con Esc y tapa el resto de la página).
 * El contenido solo se dibuja mientras está abierta; así los campos no se repiten en la página.
 */
export function EditDialog({ label, title, children, className = "text-sm font-semibold text-accent hover:underline" }: { label: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { if (open) ref.current?.showModal(); }, [open]);
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>{label}</button>
      <dialog
        ref={ref}
        aria-label={title}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === ref.current) close(); }} // clic en el fondo
        className="edit-dialog m-auto w-[min(92vw,34rem)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        {open && (
          <CloseContext.Provider value={close}>
            <div className="flex max-h-[85vh] flex-col">
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                <button type="button" onClick={close} aria-label="Cerrar" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-mute transition hover:rotate-90 hover:bg-soft hover:text-accent">✕</button>
              </div>
              <div className="overflow-y-auto p-6">{children}</div>
            </div>
          </CloseContext.Provider>
        )}
      </dialog>
    </>
  );
}
