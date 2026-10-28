import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as ProjectController from "@/controllers/project.controller";
import { PrintButton } from "@/components/app/PrintButton";
import { Logo } from "@/components/site/Logo";
import { num, round, VENT_LABEL } from "@/lib/calc";
import { fmtDate, todayISO } from "@/lib/format";
import { LEGAL } from "@/lib/legal";
import { projectCode } from "@/lib/project";

export const metadata: Metadata = { title: "Memoria de cálculo" };

export default async function Memoria({ params }: PageProps<"/app/proyectos/[id]/memoria">) {
  const projectId = Number((await params).id);
  if (!Number.isInteger(projectId) || projectId <= 0) notFound();

  const memoria = await ProjectController.getMemoria(projectId);
  if (!memoria) notFound();
  const { spaces: sp, air, zones: vz, ...row } = memoria;
  const kw = round(sp.reduce((s, r) => s + r.loadKw, 0));
  const tr = round(sp.reduce((s, r) => s + r.loadTr, 0));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between print:hidden">
        <Link href={`/app/proyectos/${projectId}?tab=documentos`} className="text-sm text-accent hover:underline">← Volver al proyecto</Link>
        <PrintButton />
      </div>
      <article className="rounded-md border border-line bg-surface p-12 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <Logo className="mb-5 h-12" />
        <p className="text-xs font-semibold uppercase tracking-widest text-mute">Memoria de cálculo · {LEGAL.company}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{row.p.name}</h1>
        <p className="mt-1 text-mute">{projectCode(row.p.id, row.p.createdAt)} · {row.client ?? row.account ?? "Sin cliente"} · {row.p.spaceType} · Entrega {fmtDate(row.p.dueDate)}</p>
        <p className="text-sm text-mute">Emitida el {fmtDate(todayISO())}</p>
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-900">Documento generado con fórmulas simplificadas de referencia. Debe ser validado por ingeniería antes de usarse.</p>

        <h2 className="mb-2 mt-8 text-xl font-bold">1. Cargas térmicas</h2>
        {sp.length === 0 ? <p className="text-mute">Sin espacios capturados.</p> : (
          <table className="tbl"><thead><tr><th>Espacio</th><th>Área (m²)</th><th>Personas</th><th>Orientación</th><th>kW</th><th>TR</th></tr></thead>
            <tbody>{sp.map((r) => <tr key={r.id}><td>{r.name}</td><td>{num(r.areaM2)}</td><td>{r.people}</td><td className="capitalize">{r.orientation}</td><td>{r.loadKw}</td><td>{r.loadTr}</td></tr>)}</tbody>
            <tfoot><tr><td colSpan={4} className="px-3 py-2 font-bold">Total</td><td className="px-3 py-2 font-bold">{kw}</td><td className="px-3 py-2 font-bold">{tr}</td></tr></tfoot></table>
        )}

        <h2 className="mb-2 mt-8 text-xl font-bold">2. Distribución de aire</h2>
        {air.length === 0 ? <p className="text-mute">Sin elementos capturados.</p> : (
          <table className="tbl"><thead><tr><th>Elemento</th><th>Tipo</th><th>Caudal (m³/h)</th><th>Medida</th></tr></thead>
            <tbody>{air.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.kind}</td><td>{num(r.flowM3h)}</td><td>{r.size}</td></tr>)}</tbody></table>
        )}

        <h2 className="mb-2 mt-8 text-xl font-bold">3. Ventilación mecánica</h2>
        {vz.length === 0 ? <p className="text-mute">Sin zonas capturadas.</p> : (
          <table className="tbl"><thead><tr><th>Zona</th><th>Tipo</th><th>Caudal (m³/h)</th></tr></thead>
            <tbody>{vz.map((r) => <tr key={r.id}><td>{r.name}</td><td>{VENT_LABEL[r.kind]}</td><td>{num(r.flowM3h)}</td></tr>)}</tbody></table>
        )}

        <div className="mt-14 grid grid-cols-2 gap-10 text-sm print:break-inside-avoid">
          <div><div className="h-12 border-b border-ink/50" /><p className="mt-2 font-semibold">Elaboró</p><p className="text-mute">Ingeniería, {LEGAL.company}</p></div>
          <div><div className="h-12 border-b border-ink/50" /><p className="mt-2 font-semibold">Revisó</p><p className="text-mute">Responsable técnico</p></div>
        </div>
      </article>
    </div>
  );
}
