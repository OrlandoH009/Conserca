"use client";

import { useRouter } from "next/navigation";

/** Vuelve a la página anterior; si se abrió directo (sin historial), va a la dirección de respaldo. */
export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))} className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-accent transition hover:-translate-x-0.5 hover:underline">
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 10H4M9 5l-5 5 5 5" /></svg>
      Regresar
    </button>
  );
}
