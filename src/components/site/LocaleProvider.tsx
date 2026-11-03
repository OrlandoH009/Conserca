"use client";

import { createContext, useContext } from "react";
import { translate, type Locale } from "@/lib/i18n";

const Ctx = createContext<Locale>("es");

/** Pone el idioma elegido (cookie `lang`) a disposición de los componentes de cliente. Va en el layout raíz. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export const useLocale = () => useContext(Ctx);

/** Para componentes de cliente: `const t = useT(); t("Texto en español")`. */
export function useT() {
  const locale = useLocale();
  return (es: string, vars?: Record<string, string | number>) => translate(locale, es, vars);
}
