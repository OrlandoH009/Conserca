"use client";

/** Botón de formulario que pide confirmación antes de enviar (para acciones que no se pueden deshacer). */
export function ConfirmButton({ message, className = "", children }: { message: string; className?: string; children: React.ReactNode }) {
  return <button className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>{children}</button>;
}
