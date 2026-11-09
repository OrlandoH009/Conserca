import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/app/ui";
import { requireAccess } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { ImportForm } from "./ImportForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Cargar proyectos previos") };
}

export default async function Importar() {
  await requireAccess("cobros", "edit");
  await requireAccess("proyectos", "edit");
  const t = await getT();
  return (
    <>
      <p className="text-sm text-mute"><Link href="/app/proyectos" className="hover:text-accent">{t("Proyectos")}</Link> / {t("Cargar proyectos previos")}</p>
      <PageHead title={t("Cargar proyectos previos")} sub={t("Llena la plantilla, súbela y revisa el resultado antes de confirmar. Después cada proyecto se edita como cualquier otro.")}>
        <a href="/plantilla-proyectos-previos.xlsx" download className="btn-ghost px-3 py-1.5 text-sm">{t("Descargar plantilla")}</a>
      </PageHead>
      <ImportForm />
    </>
  );
}
