import { getT } from "@/lib/i18n-server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as ProjectController from "@/controllers/project.controller";
import { ActionButton } from "@/components/app/ActionButton";
import { ActionForm, F } from "@/components/app/ActionForm";
import { AutoSelect } from "@/components/app/AutoSelect";
import { EditDialog } from "@/components/app/EditDialog";
import { ProgressControl } from "@/components/app/ProgressControl";
import { Badge, PageHead, ProgressBar, StatusBadge, PROJECT_STATUS } from "@/components/app/ui";
import { requireAccess } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { can, ROLE_LABEL, type Area } from "@/lib/permissions";
import { daysLate, projectCode } from "@/lib/project";
import { STAGES, suggestedProgress } from "@/lib/stages";
import { archiveProject, deleteProject, restoreProject, setProjectClientUser, setProjectProgress, setProjectStage, setProjectStatus, updateProject } from "../actions";
import { ProjectTabs, TabPane } from "./ProjectTabs";
import { Actividad } from "./tabs/Actividad";
import { Cargas } from "./tabs/Cargas";
import { Cobros } from "./tabs/Cobros";
import { Distribucion } from "./tabs/Distribucion";
import { Presupuesto } from "./tabs/Presupuesto";
import { Ventilacion } from "./tabs/Ventilacion";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Proyecto") };
}

const TABS: { key: string; label: string; area: Area; C: (p: { projectId: number; canEdit: boolean }) => Promise<React.ReactNode> | React.ReactNode }[] = [
  { key: "cargas", label: "Cargas térmicas", area: "calculos", C: Cargas },
  { key: "distribucion", label: "Distribución de aire", area: "calculos", C: Distribucion },
  { key: "ventilacion", label: "Ventilación mecánica", area: "calculos", C: Ventilacion },
  { key: "presupuesto", label: "Presupuesto estimado de construcción", area: "presupuestos", C: Presupuesto },
  { key: "cobros", label: "Cobros", area: "cobros", C: Cobros },
  { key: "actividad", label: "Actividad", area: "proyectos", C: Actividad },
];

export default async function Proyecto({ params, searchParams }: PageProps<"/app/proyectos/[id]">) {
  const t = await getT();
  const u = await requireAccess("proyectos");
  const { id } = await params;
  const sp = await searchParams;
  const projectId = Number(id);
  if (!Number.isInteger(projectId) || projectId <= 0) notFound();

  const row = await ProjectController.getDetail(projectId);
  if (!row) notFound();
  const { p, client, account } = row;

  const tabs = TABS.filter((t) => can(u.role, t.area));
  const tab = tabs.find((t) => t.key === sp.tab) ?? tabs[0];
  const canEditProject = can(u.role, "proyectos", "edit");
  const [clientUsers, clients, staff] = canEditProject
    ? await Promise.all([ProjectController.clientUserOptions(), ProjectController.clientOptions(), ProjectController.staffOptions()])
    : [[], [], []];
  const late = daysLate(p.dueDate, p.status);
  const archived = !!p.archivedAt;
  // Si la etapa guardada no está en la lista actual (datos antiguos), se muestra igual como primera opción.
  const stageOptions: [string, string][] = [...(STAGES.includes(p.stage as (typeof STAGES)[number]) ? [] : [[p.stage, p.stage] as [string, string]]), ...STAGES.map((s) => [s, s] as [string, string])];

  return (
    <>
      <p className="text-sm text-mute"><Link href="/app/proyectos" className="hover:text-accent">{t("Proyectos")}</Link> / {p.name}</p>
      <PageHead title={p.name} sub={`${projectCode(p.id, p.createdAt)} · ${client ?? account ?? t("Sin cliente")} · ${t(p.spaceType)} · ${t("Entrega")} ${fmtDate(p.dueDate)}`}>
        {canEditProject && (
          <div className="flex flex-wrap items-center gap-3">
            <EditDialog label={t("Editar datos")} title={t("Editar datos del proyecto")} className="btn-ghost">
              <ActionForm action={updateProject} submit={t("Guardar cambios")} success={t("Proyecto actualizado")}>
                <input type="hidden" name="id" value={p.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2"><F label={t("Nombre del proyecto")} name="name" defaultValue={p.name} /></div>
                  <F label={t("Tipo de espacio")} name="spaceType" defaultValue={p.spaceType} />
                  <F label={t("Fecha límite")} name="dueDate" type="date" required={false} defaultValue={p.dueDate ?? ""} />
                  <F label={t("Cliente")} name="clientId" required={false}>
                    <select key={p.clientId ?? "none"} id="clientId" name="clientId" className="input" defaultValue={p.clientId ?? ""}>
                      <option value="">{t("Sin cliente")}</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </F>
                  <F label={t("Responsable")} name="ownerId" required={false}>
                    <select key={p.ownerId ?? "none"} id="ownerId" name="ownerId" className="input" defaultValue={p.ownerId ?? ""}>
                      <option value="">{t("Sin responsable")}</option>
                      {staff.map((s) => <option key={s.id} value={s.id}>{s.name} · {t(ROLE_LABEL[s.role])}</option>)}
                    </select>
                  </F>
                </div>
              </ActionForm>
            </EditDialog>
            {archived ? (
              <>
                <ActionButton action={restoreProject} fields={{ id: p.id, on: 0 }} okText={t("Proyecto restaurado")} className="btn-ghost">{t("Restaurar")}</ActionButton>
                {can(u.role, "usuarios", "edit") && (
                  <ActionButton action={deleteProject} fields={{ id: p.id }} confirm={t("¿Eliminar «{name}» para siempre? Se borra todo lo que contiene. No se puede deshacer.", { name: p.name })} okText={t("Proyecto eliminado")} className="btn-ghost !border-red-300 !text-red-600">{t("Eliminar definitivamente")}</ActionButton>
                )}
              </>
            ) : (
              <ActionButton action={archiveProject} fields={{ id: p.id, on: 1 }} confirm={t("¿Archivar «{name}»? Deja de salir en la lista y el cliente ya no lo ve; se puede restaurar.", { name: p.name })} okText={t("Proyecto archivado")} className="btn-ghost">{t("Archivar")}</ActionButton>
            )}
          </div>
        )}
      </PageHead>
      {(archived || late > 0) && (
        <p className="-mt-3 mb-4 flex flex-wrap gap-2">
          {archived && <Badge tone="n">{t("Archivado: no sale en la lista ni lo ve el cliente")}</Badge>}
          {late > 0 && <Badge tone="r">{t("Vencido hace")} {late} {late === 1 ? t("día") : t("días")}</Badge>}
        </p>
      )}

      <section className="card mb-5 grid gap-5 md:grid-cols-2 xl:grid-cols-[0.8fr_1fr_1.3fr_1.3fr]" aria-label={t("Estado, etapa y avance")}>
        <div>
          <p className="label">{t("Estado")}</p>
          {canEditProject ? (
            <AutoSelect key={p.status} name="status" value={p.status} options={Object.entries(PROJECT_STATUS).map(([k, [l]]) => [k, l])} action={setProjectStatus} fields={{ id: p.id }} label={t("Estado del proyecto")} okText={t("Estado actualizado")} className="input w-full" />
          ) : <StatusBadge status={p.status} />}
        </div>
        <div>
          <p className="label">{t("Etapa actual")}</p>
          {canEditProject ? (
            <AutoSelect key={p.stage} name="stage" value={p.stage} options={stageOptions} action={setProjectStage} fields={{ id: p.id }} label={t("Etapa del proyecto")} okText={t("Etapa actualizada")} className="input w-full" />
          ) : <p className="font-semibold">{t(p.stage)}</p>}
        </div>
        <div>
          <p className="label">{t("Avance que ve el cliente")}</p>
          <ProgressBar value={p.progress} />
          {canEditProject && <div className="mt-3"><ProgressControl key={p.progress} projectId={p.id} value={p.progress} suggested={suggestedProgress(p.stage)} action={setProjectProgress} /></div>}
        </div>
        <div>
          <p className="label">{t("Cuenta del cliente en el sitio")}</p>
          {canEditProject ? (
            <AutoSelect
              key={p.clientUserId ?? "none"}
              name="userId"
              value={String(p.clientUserId ?? "")}
              options={[["", t("Sin cuenta (el cliente no ve este proyecto)")], ...clientUsers.map((c) => [String(c.id), `${c.name} · ${c.email}`] as [string, string])]}
              action={setProjectClientUser}
              fields={{ id: p.id }}
              label={t("Cuenta del cliente")}
              okText={t("Cuenta del cliente actualizada")}
              className="input w-full"
            />
          ) : <p className="text-sm text-mute">{account ?? t("Sin cuenta ligada")}</p>}
        </div>
      </section>

      <ProjectTabs projectId={p.id} tabs={tabs.map(({ key, label }) => ({ key, label }))} active={tab.key} />
      {tab ? <TabPane key={tab.key}>{await tab.C({ projectId: p.id, canEdit: can(u.role, tab.area, "edit") })}</TabPane> : null}
    </>
  );
}
