"use client";

import { useT } from "@/components/site/LocaleProvider";

export function PrintButton() {
  const t = useT();
  return <button onClick={() => window.print()} className="btn">{t("Imprimir / guardar como PDF")}</button>;
}
