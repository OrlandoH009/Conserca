import type { Metadata } from "next";
import Link from "next/link";
import * as ProjectController from "@/controllers/project.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Empty, PageHead, StatusBadge, PROJECT_STATUS } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { createProject } from "./actions";

export const metadata: Metadata = { title: "Proyectos" };

export default async function Proyectos({ searchParams }: PageProps<"/app/proyectos">) {
  const sp = await searchParams;
  const estado = typeof sp.estado === "string" && sp.estado in PROJECT_STATUS ? (sp.estado as keyof typeof PROJECT_STATUS) : null;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [list, clients, me] = await Promise.all([
    ProjectController.list({ estado: estado ?? undefined, q }),
    ProjectController.clientOptions(),
    currentUser(),
  ]);
  const canEdit = !!me && can(me.role, "proyectos", "edit");

  return (
    <>
      <PageHead title="Proyectos" sub="Todos los proyectos de diseño y supervisión" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Buscar por nombre o cliente" className="input w-72" />
          {estado && <input type="hidden" name="estado" value={estado} />}
          <button className="btn-ghost">Buscar</button>
        </form>
        <Link href="/app/proyectos" className={`badge px-3 py-1.5 ${!estado ? "bg-soft text-accent" : "bg-white text-mute ring-1 ring-line"}`}>Todos</Link>
        {Object.entries(PROJECT_STATUS).map(([k, [label]]) => (
          <Link key={k} href={`/app/proyectos?estado=${k}`} className={`badge px-3 py-1.5 ${estado === k ? "bg-soft text-accent" : "bg-white text-mute ring-1 ring-line"}`}>{label}</Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        {list.length === 0 ? <Empty>No hay proyectos con ese filtro.</Empty> : (
          <table className="tbl">
            <thead><tr><th>Proyecto</th><th>Cliente</th><th>Tipo de espacio</th><th>Etapa</th><th>Entrega</th><th>Estado</th></tr></thead>
            <tbody>
              {list.map(({ p, client }) => (
                <tr key={p.id}>
                  <td><Link href={`/app/proyectos/${p.id}`} className="font-medium hover:text-accent">{p.name}</Link></td>
                  <td>{client ?? "—"}</td><td>{p.spaceType}</td><td>{p.stage}</td><td>{fmtDate(p.dueDate)}</td><td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {canEdit && (
        <details className="card mt-6">
          <summary className="cursor-pointer font-bold">+ Nuevo proyecto</summary>
          <ActionForm action={createProject} submit="Crear proyecto" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <F label="Nombre del proyecto" name="name" placeholder="Proyecto ejemplo 07 · Escuela" />
              <F label="Tipo de espacio" name="spaceType" placeholder="Oficinas, estacionamiento, bodega…" />
              <F label="Cliente" name="clientId" required={false}>
                <select id="clientId" name="clientId" className="input" defaultValue="">
                  <option value="">Sin cliente</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </F>
              <F label="Fecha de entrega" name="dueDate" type="date" required={false} />
            </div>
          </ActionForm>
        </details>
      )}
    </>
  );
}
