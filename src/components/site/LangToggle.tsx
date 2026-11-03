"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

/** Cambia entre español e inglés: guarda la cookie `lang` y vuelve a pedir la página al servidor. */
export function LangToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const next = locale === "en" ? "es" : "en";
  const change = () => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  return (
    <button onClick={change} lang={next} aria-label={next === "en" ? "Switch to English" : "Cambiar a español"} title={next === "en" ? "English" : "Español"} className={`flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full px-2.5 text-xs font-bold tracking-wide text-mute transition duration-300 hover:bg-soft hover:text-accent active:scale-90 ${className}`}>
      {next.toUpperCase()}
    </button>
  );
}
