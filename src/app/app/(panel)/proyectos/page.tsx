import { getT } from "@/lib/i18n-server";
import type { Metadata } from "next";
import Link from "next/link";
import * as ProjectController from "@/controllers/project.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Badge, Empty, PageHead, StatusBadge, PROJECT_STATUS } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { projectCode } from "@/lib/project";
import { createProject } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Proyectos") };
}

export default async function Proyectos({ searchParams }: PageProps<"/app/proyectos">) {
  const t = await getT();
  const sp = await searchParams;
  const estado = typeof sp.estado === "string" && sp.estado in PROJECT_STATUS ? (sp.estado as keyof typeof PROJECT_STATUS) : null;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const archivados = sp.archivados === "1";

  const [list, clients, archivedCount, me] = await Promise.all([
    ProjectController.list({ estado: estado ?? undefined, q, archivados }),
    ProjectController.clientOptions(),
    ProjectController.archivedCount(),
    currentUser(),
  ]);
  const canEdit = !!me && can(me.role, "proyectos", "edit");
  const keep = (over: Record<string, string>) => `/app/proyectos?${new URLSearchParams({ ...(archivados ? { archivados: "1" } : {}), ...(q ? { q } : {}), ...over })}`;

  return (
    <>
      <PageHead title={archivados ? t("Proyectos archivados") : t("Proyectos")} sub={archivados ? t("No salen en la lista normal ni los ve el cliente") : t("Todos los proyectos de diseño y supervisión")}>
        {(archivedCount > 0 || archivados) && (
          <Link href={archivados ? "/app/proyectos" : "/app/proyectos?archivados=1"} className="btn-ghost px-3 py-1.5 text-sm">
            {archivados ? t("← Ver proyectos activos") : `${t("Ver archivados")} (${archivedCount})`}
          </Link>
        )}
      </PageHead>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form className="flex w-full gap-2 sm:w-auto">
          <input name="q" defaultValue={q} placeholder={t("Buscar por nombre o cliente")} className="input w-full sm:w-72" aria-label={t("Buscar proyectos")} />
          {estado && <input type="hidden" name="estado" value={estado} />}
          {archivados && <input type="hidden" name="archivados" value="1" />}
          <button className="btn-ghost">{t("Buscar")}</button>
        </form>
        <Link href={keep({})} className={`badge px-3 py-1.5 ${!estado ? "bg-soft text-accent" : "bg-surface text-mute ring-1 ring-line"}`}>{t("Todos")}</Link>
        {Object.entries(PROJECT_STATUS).map(([k, [label]]) => (
          <Link key={k} href={keep({ estado: k })} className={`badge px-3 py-1.5 ${estado === k ? "bg-soft text-accent" : "bg-surface text-mute ring-1 ring-line"}`}>{t(label)}</Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        {list.length === 0 ? <Empty>{t("No hay proyectos con ese filtro.")}</Empty> : (
          <table className="tbl">
            <thead><tr><th>{t("Proyecto")}</th><th>{t("Cliente")}</th><th>{t("Tipo de espacio")}</th><th>{t("Etapa")}</th><th>{t("Avance")}</th><th>{t("Entrega")}</th><th>{t("Estado")}</th></tr></thead>
            <tbody>
              {list.map(({ p, client, account, late }) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/app/proyectos/${p.id}`} className="font-medium hover:text-accent">{p.name}</Link>
                    <div className="text-xs text-mute">{projectCode(p.id, p.createdAt)}</div>
                  </td>
                  <td>{client ?? account ?? "—"}</td><td>{p.spaceType}</td><td>{t(p.stage)}</td>
                  <td>
                    <div className="flex items-center gap-2" title={`${p.progress} %`}>
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-accent-solid" style={{ width: `${p.progress}%` }} /></span>
                      <span className="text-xs tabular-nums text-mute">{p.progress}%</span>
                    </div>
                  </td>
                  <td>{fmtDate(p.dueDate)}{late > 0 && <span className="ml-1.5 align-middle"><Badge tone="r">{t("Vencido")}</Badge></span>}</td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {canEdit && !archivados && (
        <details className="card mt-6">
          <summary className="cursor-pointer font-bold">{t("+ Nuevo proyecto")}</summary>
          <ActionForm action={createProject} submit={t("Crear proyecto")} success={t("Proyecto creado")} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <F label={t("Nombre del proyecto")} name="name" placeholder={t("Edificio de oficinas · Cliente")} />
              <F label={t("Tipo de espacio")} name="spaceType" placeholder={t("Oficinas, estacionamiento, bodega…")} />
              <F label={t("Cliente")} name="clientId" required={false}>
                <select id="clientId" name="clientId" className="input" defaultValue="">
                  <option value="">{t("Sin cliente")}</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </F>
              <F label={t("Fecha de entrega")} name="dueDate" type="date" required={false} />
            </div>
          </ActionForm>
        </details>
      )}
    </>
  );
}
