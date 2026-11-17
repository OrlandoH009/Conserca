"use client";

import { useRouter } from "next/navigation";
import { useT } from "./LocaleProvider";

/** Vuelve a la página anterior; si se abrió directo (sin historial), va a la dirección de respaldo. */
export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();
  const t = useT();
  return (
    <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))} className="-ml-2 mb-3 inline-flex min-h-11 cursor-pointer px-2 items-center gap-2 text-sm font-semibold text-accent transition hover:-translate-x-0.5 hover:underline">
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 10H4M9 5l-5 5 5 5" /></svg>
      {t("Regresar")}
    </button>
  );
}
