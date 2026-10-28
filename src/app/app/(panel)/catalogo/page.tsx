import type { Metadata } from "next";
import * as CatalogController from "@/controllers/catalog.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Empty, PageHead } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { can } from "@/lib/permissions";
import { addEquipment, removeEquipment } from "./actions";

export const metadata: Metadata = { title: "Catálogo" };

export default async function Catalogo({ searchParams }: PageProps<"/app/catalogo">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const [rows, u] = await Promise.all([CatalogController.list(q), currentUser()]);
  const canEdit = !!u && can(u.role, "catalogo", "edit");
  return (
    <>
      <PageHead title="Catálogo de equipos y materiales" sub="Base para las especificaciones técnicas" />
      <form className="mb-4 flex gap-2"><input name="q" defaultValue={q} className="input w-full sm:w-72" placeholder="Buscar equipo o material" /><button className="btn-ghost">Buscar</button></form>
      <div className="card overflow-x-auto">
        {rows.length === 0 ? <Empty>No hay resultados.</Empty> : (
          <table className="tbl">
            <thead><tr><th>Nombre</th><th>Categoría</th><th>Capacidad / medida</th><th>Marca</th><th>Actualizado</th>{canEdit && <th></th>}</tr></thead>
            <tbody>{rows.map((r) => <tr key={r.id}><td className="font-medium">{r.name}</td><td>{r.category}</td><td>{r.capacity}</td><td>{r.brand}</td><td>{fmtDateTime(r.updatedAt)}</td>{canEdit && <td><form action={removeEquipment}><input type="hidden" name="id" value={r.id} /><button className="text-xs text-red-700 hover:underline">Quitar</button></form></td>}</tr>)}</tbody>
          </table>
        )}
      </div>
      {canEdit && (
        <details className="card mt-6">
          <summary className="cursor-pointer font-bold">+ Agregar equipo o material</summary>
          <ActionForm action={addEquipment} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <F label="Nombre" name="name" placeholder="Extractor axial" />
              <F label="Categoría" name="category" placeholder="Extractores" />
              <F label="Capacidad o medida" name="capacity" placeholder="12,000 m³/h" />
              <F label="Marca" name="brand" required={false} placeholder="Genérico" />
            </div>
          </ActionForm>
        </details>
      )}
    </>
  );
}
