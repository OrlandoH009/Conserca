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
    <button onClick={change} aria-label={locale === "es" ? "Cambiar a inglés" : "Switch to Spanish"} title={next === "en" ? "English" : "Español"} className={`flex h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-full px-2.5 sm:h-9 sm:min-w-0 text-xs font-bold tracking-wide text-mute transition duration-300 hover:bg-soft hover:text-accent active:scale-90 ${className}`}>
      <span lang={next}>{next.toUpperCase()}</span>
    </button>
  );
}
