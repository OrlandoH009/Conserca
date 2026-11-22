import { getT } from "@/lib/i18n-server";
import type { Metadata } from "next";
import Link from "next/link";
import * as ProjectController from "@/controllers/project.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { EditDialog } from "@/components/app/EditDialog";
import { FilterMenu } from "@/components/app/FilterMenu";
import { Empty, PageHead, StatusBadge, PROJECT_STATUS } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
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
  const canBill = !!me && can(me.role, "cobros", "edit");
  const keep = (over: Record<string, string>) => `/app/proyectos?${new URLSearchParams({ ...(archivados ? { archivados: "1" } : {}), ...(q ? { q } : {}), ...over })}`;

  return (
    <>
      <PageHead title={archivados ? t("Proyectos archivados") : t("Proyectos")} sub={archivados ? t("No salen en la lista normal ni los ve el cliente") : t("Todos los proyectos de diseño")}>
        {canEdit && canBill && !archivados && <Link href="/app/proyectos/importar" className="btn-ghost px-3 py-1.5 text-sm">{t("Cargar proyectos previos")}</Link>}
        {(archivedCount > 0 || archivados) && (
          <Link href={archivados ? "/app/proyectos" : "/app/proyectos?archivados=1"} className="btn-ghost px-3 py-1.5 text-sm">
            {archivados ? t("← Ver proyectos activos") : `${t("Ver archivados")} (${archivedCount})`}
          </Link>
        )}
      </PageHead>
      {/* Igual que en Clientes: búsqueda con lupa dentro de la barra y filtro desplegable a la derecha. */}
      <div className="mb-4 flex gap-2">
        <form role="search" className="relative min-w-0 flex-1">
          <input name="q" defaultValue={q} placeholder={t("Buscar por nombre o cliente")} className="input w-full !pr-12" aria-label={t("Buscar proyectos")} />
          {estado && <input type="hidden" name="estado" value={estado} />}
          {archivados && <input type="hidden" name="archivados" value="1" />}
          <button aria-label={t("Buscar")} className="absolute inset-y-1 right-1 flex w-10 cursor-pointer items-center justify-center rounded-lg text-mute transition-colors hover:bg-soft hover:text-accent active:scale-95">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </button>
        </form>
        <FilterMenu
          label={t("Filtrar por estado")}
          current={estado ?? ""}
          options={[{ key: "", label: "Todos", href: keep({}) }, ...Object.entries(PROJECT_STATUS).map(([k, [label]]) => ({ key: k, label, href: keep({ estado: k }) }))]}
        />
      </div>
      <div className="card overflow-x-auto">
        {list.length === 0 ? <Empty className="py-16 text-base">{t("No hay proyectos con ese filtro.")}</Empty> : (
          <table className="tbl tbl-stack">
            <thead><tr><th>{t("Proyecto")}</th><th>{t("Cliente")}</th><th>{t("Tipo de espacio")}</th><th>{t("Etapa")}</th><th>{t("Avance")}</th><th>{t("Entrega")}</th><th>{t("Estado")}</th></tr></thead>
            <tbody>
              {list.map(({ p, client, account, late }) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/app/proyectos/${p.id}`} className="font-medium hover:text-accent">{p.name}</Link>
                    <div className="text-xs text-mute">{projectCode(p.id, p.createdAt)}</div>
                  </td>
                  <td data-label={t("Cliente")}>{client ?? account ?? "—"}</td><td data-label={t("Tipo de espacio")}>{p.spaceType}</td><td data-label={t("Etapa")}>{t(p.stage)}</td>
                  <td data-label={t("Avance")}>
                    <div className="flex items-center gap-2" title={`${p.progress} %`}>
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-accent-solid" style={{ width: `${p.progress}%` }} /></span>
                      <span className="text-xs tabular-nums text-mute">{p.progress}%</span>
                    </div>
                  </td>
                  <td data-label={t("Entrega")} className={late > 0 ? "font-medium text-red-600" : undefined} title={late > 0 ? `${t("Vencido hace")} ${late} ${late === 1 ? t("día") : t("días")}` : undefined}>{fmtDate(p.dueDate)}</td>
                  <td data-label={t("Estado")}><StatusBadge status={p.status} /></td>
                  {/* Celular: botón visible para abrir (el nombre solo es un renglón de texto). */}
                  <td className="sm:hidden"><Link href={`/app/proyectos/${p.id}`} className="btn-ghost btn-line mt-1 w-full py-2 text-sm">{t("Abrir proyecto")}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {canEdit && !archivados && (
        // Mismo patrón que "+ Agregar cliente" e "+ Invitar usuario": botón del ancho de la tarjeta que abre un modal grande.
        <div className="mt-6">
        <EditDialog size="lg" label={t("+ Nuevo proyecto")} title={t("Nuevo proyecto")} className="card block w-full cursor-pointer text-left font-bold transition-colors hover:text-accent">
          <ActionForm action={createProject} submit={t("Crear proyecto")} success={t("Proyecto creado")}>
            <div className="grid gap-4 md:grid-cols-2">
              <F label={t("Nombre del proyecto")} name="name" placeholder={t("Edificio de oficinas · Cliente")} />
              <F label={t("Tipo de espacio")} name="spaceType" placeholder={t("Oficinas, estacionamiento, bodega…")} />
              <F label={t("Cliente")} name="clientId" required={false}>
                <select id="clientId" name="clientId" className="input" defaultValue="">
                  <option value="">{t("Sin cliente")}</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </F>
              <F label={t("Fecha límite")} name="dueDate" type="date" required={false} />
              {canBill && <F label={t("Honorarios del diseño ({currency})", { currency: CONFIG.currency })} name="total" type="number" step="any" required={false} />}
            </div>
          </ActionForm>
        </EditDialog>
        </div>
      )}
    </>
  );
}
