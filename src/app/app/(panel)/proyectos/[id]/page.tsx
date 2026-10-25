import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as ProjectController from "@/controllers/project.controller";
import { PageHead, StatusBadge, PROJECT_STATUS } from "@/components/app/ui";
import { requireAccess } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { can, type Area } from "@/lib/permissions";
import { setProjectStatus } from "../actions";
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
];

export default async function Proyecto({ params, searchParams }: PageProps<"/app/proyectos/[id]">) {
  const u = await requireAccess("proyectos");
  const { id } = await params;
  const sp = await searchParams;
  const projectId = Number(id);
  if (!Number.isInteger(projectId) || projectId <= 0) notFound();

  const row = await ProjectController.getDetail(projectId);
  if (!row) notFound();
  const { p, client } = row;

  const tabs = TABS.filter((t) => can(u.role, t.area));
  const tab = tabs.find((t) => t.key === sp.tab) ?? tabs[0];
  const canEditProject = can(u.role, "proyectos", "edit");

  return (
    <>
      <p className="text-sm text-mute"><Link href="/app/proyectos" className="hover:text-accent">Proyectos</Link> / {p.name}</p>
      <PageHead title={p.name} sub={`${client ?? "Sin cliente"} · ${p.spaceType} · Entrega ${fmtDate(p.dueDate)}`}>
        {canEditProject ? (
          <form action={setProjectStatus} className="flex items-center gap-2">
            <input type="hidden" name="id" value={p.id} />
            <select name="status" defaultValue={p.status} className="input w-40" aria-label="Estado del proyecto">
              {Object.entries(PROJECT_STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <button className="btn-ghost">Cambiar estado</button>
          </form>
        ) : <StatusBadge status={p.status} />}
      </PageHead>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <Link key={t.key} href={`/app/proyectos/${p.id}?tab=${t.key}`} className={`whitespace-nowrap border-b-[3px] px-4 py-2.5 text-sm transition ${t.key === tab.key ? "border-accent font-semibold text-accent" : "border-transparent text-mute hover:text-ink"}`}>
            {t.label}
          </Link>
        ))}
      </div>
      {tab ? await tab.C({ projectId: p.id, canEdit: can(u.role, tab.area, "edit") }) : null}
    </>
  );
}
