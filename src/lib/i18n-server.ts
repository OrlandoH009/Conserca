import { cookies } from "next/headers";
import { LOCALE_COOKIE, toLocale, translate } from "./i18n";

export async function getLocale() {
  return toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

/** Para componentes de servidor: `const t = await getT(); t("Texto en español")`. */
export async function getT() {
  const locale = await getLocale();
  return (es: string, vars?: Record<string, string | number>) => translate(locale, es, vars);
}
