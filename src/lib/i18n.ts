import { EN } from "./i18n-en";

export type Locale = "es" | "en";
export const LOCALE_COOKIE = "lang";

export const toLocale = (v: string | undefined | null): Locale => (v === "en" ? "en" : "es");

const fill = (text: string, vars?: Record<string, string | number>) =>
  vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text;

// Claves con {marcadores} que también sirven para reconocer mensajes que el servidor ya armó en español
// ("Ese archivo pesa 12 MB…"): se comparan como patrón y lo capturado se traduce aparte.
const PATTERNS = Object.keys(EN)
  .filter((k) => /\{\w+\}/.test(k))
  .map((k) => {
    const names: string[] = [];
    const src = k.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\w+)\}/g, (_, n: string) => (names.push(n), "(.+?)"));
    return { re: new RegExp(`^${src}$`, "s"), names, en: EN[k] };
  });

/**
 * Traduce un texto escrito en español. El español es la clave: si no hay traducción, se muestra tal cual.
 * `{nombre}` en el texto se reemplaza con `vars.nombre`.
 */
export function translate(locale: Locale, es: string, vars?: Record<string, string | number>): string {
  if (locale !== "en") return fill(es, vars);
  const exact = EN[es];
  if (exact !== undefined) return fill(exact, vars);
  for (const p of PATTERNS) {
    const m = p.re.exec(es);
    if (m) return fill(p.en, Object.fromEntries(p.names.map((n, i) => [n, translate("en", m[i + 1])])));
  }
  return fill(es, vars);
}
