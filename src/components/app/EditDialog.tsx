"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useT } from "@/components/site/LocaleProvider";

const CloseContext = createContext<(() => void) | null>(null);
/** Dentro de una ventana de edición devuelve la función para cerrarla (los formularios la llaman al guardar). */
export const useDialogClose = () => useContext(CloseContext);

/**
 * Botón + ventana (<dialog> nativo: atrapa el foco, se cierra con Esc y tapa el resto de la página).
 * El contenido solo se dibuja mientras está abierta; así los campos no se repiten en la página.
 */
export function EditDialog({ label, title, children, className = "text-sm font-semibold text-accent hover:underline", size = "md" }: { label: React.ReactNode; title: string; children: React.ReactNode; className?: string; size?: "md" | "lg" }) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const downOnBackdrop = useRef(false);

  useEffect(() => { if (open) ref.current?.showModal(); }, [open]);
  const close = () => ref.current?.close();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>{label}</button>
      <dialog
        ref={ref}
        aria-label={title}
        onClose={(e) => { if (e.target === ref.current) setOpen(false); }} // no el de una confirmación interna
        // Solo cierra si el clic empezó y terminó en el fondo: arrastrar al seleccionar texto no cuenta.
        onMouseDown={(e) => { downOnBackdrop.current = e.target === ref.current; }}
        onClick={(e) => { if (downOnBackdrop.current && e.target === ref.current) close(); }}
        className={`edit-dialog m-auto ${size === "lg" ? "w-[min(94vw,46rem)]" : "w-[min(92vw,34rem)]"} rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm`}
      >
        {open && (
          <CloseContext.Provider value={close}>
            <div className="flex max-h-[85vh] flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
                <h2 className="min-w-0 text-lg font-semibold tracking-tight">{title}</h2>
                <button type="button" onClick={close} aria-label={t("Cerrar")} className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-soft text-mute transition hover:rotate-90 hover:text-accent sm:h-8 sm:w-8 sm:bg-transparent sm:hover:bg-soft">✕</button>
              </div>
              <div className="overflow-y-auto p-6">{children}</div>
            </div>
          </CloseContext.Provider>
        )}
      </dialog>
    </>
  );
}
