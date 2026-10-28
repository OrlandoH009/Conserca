"use client";

import { useState } from "react";

/** Campo de contraseña con un botón de ojo para mostrarla u ocultarla. */
export function PasswordInput({ className = "", ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={`input pr-11 ${className}`} />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-xl text-mute transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {show ? (
            <><path d="M3 3l18 18" /><path d="M10.6 6.1A10.7 10.7 0 0 1 12 6c5.5 0 9.3 4.2 10 6-.3.8-1.2 2.2-2.7 3.5M6.6 6.7C4.1 8.2 2.6 10.5 2 12c.7 1.8 4.5 6 10 6 1.7 0 3.2-.4 4.4-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>
          ) : (
            <><path d="M2 12c.7-1.8 4.5-6 10-6s9.3 4.2 10 6c-.7 1.8-4.5 6-10 6S2.7 13.8 2 12Z" /><circle cx="12" cy="12" r="3" /></>
          )}
        </svg>
      </button>
    </div>
  );
}
