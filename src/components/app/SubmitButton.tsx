"use client";

import { useFormStatus } from "react-dom";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} animate-spin`} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Botón de envío para formularios con acción de servidor: se desactiva y muestra un indicador mientras se guarda. */
export function SubmitButton({ children, pendingText, className = "btn", disabled }: { children: React.ReactNode; pendingText?: string; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} aria-busy={pending} className={className}>
      {pending && <Spinner />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
