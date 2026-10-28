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
import { Distribucion } from "./tabs/Distribucion";
import { Documentos } from "./tabs/Documentos";
import { Presupuesto } from "./tabs/Presupuesto";
import { Supervision } from "./tabs/Supervision";
import { Ventilacion } from "./tabs/Ventilacion";

export const metadata: Metadata = { title: "Proyecto" };

const TABS: { key: string; label: string; area: Area; C: (p: { projectId: number; canEdit: boolean }) => Promise<React.ReactNode> | React.ReactNode }[] = [
  { key: "cargas", label: "Cargas térmicas", area: "calculos", C: Cargas },
  { key: "distribucion", label: "Distribución de aire", area: "calculos", C: Distribucion },
  { key: "ventilacion", label: "Ventilación mecánica", area: "calculos", C: Ventilacion },
  { key: "documentos", label: "Documentos", area: "proyectos", C: Documentos },
  { key: "presupuesto", label: "Presupuesto", area: "presupuestos", C: Presupuesto },
  { key: "supervision", label: "Supervisión", area: "supervision", C: Supervision },
  { key: "actividad", label: "Actividad", area: "proyectos", C: Actividad },
];

export default async function Proyecto({ params, searchParams }: PageProps<"/app/proyectos/[id]">) {
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
      <p className="text-sm text-mute"><Link href="/app/proyectos" className="hover:text-accent">Proyectos</Link> / {p.name}</p>
      <PageHead title={p.name} sub={`${projectCode(p.id, p.createdAt)} · ${client ?? account ?? "Sin cliente"} · ${p.spaceType} · Entrega ${fmtDate(p.dueDate)}`}>
        {canEditProject && (
          <div className="flex flex-wrap items-center gap-3">
            <EditDialog label="Editar datos" title="Editar datos del proyecto" className="btn-ghost">
              <ActionForm action={updateProject} submit="Guardar cambios" success="Proyecto actualizado">
                <input type="hidden" name="id" value={p.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2"><F label="Nombre del proyecto" name="name" defaultValue={p.name} /></div>
                  <F label="Tipo de espacio" name="spaceType" defaultValue={p.spaceType} />
                  <F label="Fecha de entrega" name="dueDate" type="date" required={false} defaultValue={p.dueDate ?? ""} />
                  <F label="Cliente" name="clientId" required={false}>
                    <select key={p.clientId ?? "none"} id="clientId" name="clientId" className="input" defaultValue={p.clientId ?? ""}>
                      <option value="">Sin cliente</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </F>
                  <F label="Responsable" name="ownerId" required={false}>
                    <select key={p.ownerId ?? "none"} id="ownerId" name="ownerId" className="input" defaultValue={p.ownerId ?? ""}>
                      <option value="">Sin responsable</option>
                      {staff.map((s) => <option key={s.id} value={s.id}>{s.name} · {ROLE_LABEL[s.role]}</option>)}
                    </select>
                  </F>
                </div>
              </ActionForm>
            </EditDialog>
            {archived ? (
              <>
                <ActionButton action={restoreProject} fields={{ id: p.id, on: 0 }} okText="Proyecto restaurado" className="btn-ghost">Restaurar</ActionButton>
                {can(u.role, "usuarios", "edit") && (
                  <ActionButton action={deleteProject} fields={{ id: p.id }} confirm={`¿Eliminar «${p.name}» para siempre? Se borran sus cálculos, documentos y PDF. No se puede deshacer.`} okText="Proyecto eliminado" className="btn-ghost !border-red-300 !text-red-600">Eliminar definitivamente</ActionButton>
                )}
              </>
            ) : (
              <ActionButton action={archiveProject} fields={{ id: p.id, on: 1 }} confirm={`¿Archivar «${p.name}»? Deja de salir en la lista y el cliente ya no lo ve; se puede restaurar.`} okText="Proyecto archivado" className="btn-ghost">Archivar</ActionButton>
            )}
          </div>
        )}
      </PageHead>
      {(archived || late > 0) && (
        <p className="-mt-3 mb-4 flex flex-wrap gap-2">
          {archived && <Badge tone="n">Archivado: no sale en la lista ni lo ve el cliente</Badge>}
          {late > 0 && <Badge tone="r">Vencido hace {late} {late === 1 ? "día" : "días"}</Badge>}
        </p>
      )}

      <section className="card mb-5 grid gap-5 md:grid-cols-2 xl:grid-cols-[0.8fr_1fr_1.3fr_1.3fr]" aria-label="Estado, etapa y avance">
        <div>
          <p className="label">Estado</p>
          {canEditProject ? (
            <AutoSelect key={p.status} name="status" value={p.status} options={Object.entries(PROJECT_STATUS).map(([k, [l]]) => [k, l])} action={setProjectStatus} fields={{ id: p.id }} label="Estado del proyecto" okText="Estado actualizado" className="input w-full" />
          ) : <StatusBadge status={p.status} />}
        </div>
        <div>
          <p className="label">Etapa actual</p>
          {canEditProject ? (
            <AutoSelect key={p.stage} name="stage" value={p.stage} options={stageOptions} action={setProjectStage} fields={{ id: p.id }} label="Etapa del proyecto" okText="Etapa actualizada" className="input w-full" />
          ) : <p className="font-semibold">{p.stage}</p>}
        </div>
        <div>
          <p className="label">Avance que ve el cliente</p>
          <ProgressBar value={p.progress} />
          {canEditProject && <div className="mt-3"><ProgressControl key={p.progress} projectId={p.id} value={p.progress} suggested={suggestedProgress(p.stage)} action={setProjectProgress} /></div>}
        </div>
        <div>
          <p className="label">Cuenta del cliente en el sitio</p>
          {canEditProject ? (
            <AutoSelect
              key={p.clientUserId ?? "none"}
              name="userId"
              value={String(p.clientUserId ?? "")}
              options={[["", "Sin cuenta (el cliente no ve este proyecto)"], ...clientUsers.map((c) => [String(c.id), `${c.name} · ${c.email}`] as [string, string])]}
              action={setProjectClientUser}
              fields={{ id: p.id }}
              label="Cuenta del cliente"
              okText="Cuenta del cliente actualizada"
              className="input w-full"
            />
          ) : <p className="text-sm text-mute">{account ?? "Sin cuenta ligada"}</p>}
        </div>
      </section>

      <ProjectTabs projectId={p.id} tabs={tabs.map(({ key, label }) => ({ key, label }))} active={tab.key} />
      {tab ? <TabPane key={tab.key}>{await tab.C({ projectId: p.id, canEdit: can(u.role, tab.area, "edit") })}</TabPane> : null}
    </>
  );
}
