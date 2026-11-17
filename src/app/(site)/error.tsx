"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useT } from "@/components/site/LocaleProvider";

// Si una página del sitio falla al cargar: mensaje amable, reintentar o volver al inicio (la barra y el pie siguen en su lugar).
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useT();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 pb-20 pt-32 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("Algo salió mal")}</h1>
        <p className="mx-auto mt-3 max-w-md text-mute">{t("Tuvimos un problema al cargar esta página. Inténtalo de nuevo; si sigue pasando, vuelve al inicio.")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => retry()} className="btn btn-lg">{t("Reintentar")}</button>
          <Link href="/" className="btn-ghost btn-lg">{t("Volver al inicio")}</Link>
        </div>
      </div>
    </div>
  );
}
