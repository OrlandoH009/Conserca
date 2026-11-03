import { getT } from "@/lib/i18n-server";
import type { Metadata } from "next";
import * as CatalogController from "@/controllers/catalog.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Empty, PageHead } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { can } from "@/lib/permissions";
import { addEquipment, removeEquipment } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Catálogo") };
}

export default async function Catalogo({ searchParams }: PageProps<"/app/catalogo">) {
  const t = await getT();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const [rows, u] = await Promise.all([CatalogController.list(q), currentUser()]);
  const canEdit = !!u && can(u.role, "catalogo", "edit");
  return (
    <>
      <PageHead title={t("Catálogo de equipos y materiales")} sub={t("Base para las especificaciones técnicas")} />
      <form className="mb-4 flex gap-2"><input name="q" defaultValue={q} className="input w-full sm:w-72" placeholder={t("Buscar equipo o material")} /><button className="btn-ghost">{t("Buscar")}</button></form>
      <div className="card overflow-x-auto">
        {rows.length === 0 ? <Empty>{t("No hay resultados.")}</Empty> : (
          <table className="tbl">
            <thead><tr><th>{t("Nombre")}</th><th>{t("Categoría")}</th><th>{t("Capacidad / medida")}</th><th>{t("Marca")}</th><th>{t("Actualizado")}</th>{canEdit && <th></th>}</tr></thead>
            <tbody>{rows.map((r) => <tr key={r.id}><td className="font-medium">{r.name}</td><td>{r.category}</td><td>{r.capacity}</td><td>{r.brand}</td><td>{fmtDateTime(r.updatedAt)}</td>{canEdit && <td><form action={removeEquipment}><input type="hidden" name="id" value={r.id} /><button className="text-xs text-red-700 hover:underline">{t("Quitar")}</button></form></td>}</tr>)}</tbody>
          </table>
        )}
      </div>
      {canEdit && (
        <details className="card mt-6">
          <summary className="cursor-pointer font-bold">{t("+ Agregar equipo o material")}</summary>
          <ActionForm action={addEquipment} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <F label={t("Nombre")} name="name" placeholder={t("Extractor axial")} />
              <F label={t("Categoría")} name="category" placeholder={t("Extractores")} />
              <F label={t("Capacidad o medida")} name="capacity" placeholder={t("12,000 m³/h")} />
              <F label={t("Marca")} name="brand" required={false} placeholder={t("Genérico")} />
            </div>
          </ActionForm>
        </details>
      )}
    </>
  );
}
