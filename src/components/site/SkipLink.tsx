import { getT } from "@/lib/i18n-server";

/** Primer enlace de la página para quien navega con teclado: salta la barra y va directo al contenido (ver .skip-link en globals.css). */
export async function SkipLink() {
  const t = await getT();
  return <a href="#contenido" className="skip-link">{t("Saltar al contenido")}</a>;
}
