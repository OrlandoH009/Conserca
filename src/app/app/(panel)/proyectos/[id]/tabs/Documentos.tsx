import Link from "next/link";
import * as DocumentController from "@/controllers/document.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Badge, Empty } from "@/components/app/ui";
import { fmtDateTime } from "@/lib/format";
import { createDocument, setDocumentStatus } from "../../actions";

const STATUS = { en_proceso: ["En proceso", "b"], en_revision: ["En revisión", "a"], entregado: ["Entregado", "g"] } as const;
const KIND = { memoria: "Memoria de cálculo", especificaciones: "Especificaciones", presupuesto: "Presupuesto" } as const;

export async function Documentos({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const rows = await DocumentController.documentsOf(projectId);
  return (
    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Documentos del proyecto</h2>
          <Link href={`/app/proyectos/${projectId}/memoria`} className="btn-ghost">Ver memoria de cálculo</Link>
        </div>
        {rows.length === 0 ? <Empty>Aún no hay documentos.</Empty> : rows.map((d) => {
          const [label, tone] = STATUS[d.status];
          return (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
              <div>
                <p className="font-semibold">{d.title}</p>
                <p className="text-sm text-mute">{KIND[d.kind as keyof typeof KIND] ?? d.kind} · versión {d.version} · {fmtDateTime(d.createdAt)}</p>
              </div>
              {canEdit ? (
                <form action={setDocumentStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={d.id} /><input type="hidden" name="projectId" value={projectId} />
                  <select name="status" defaultValue={d.status} className="input h-9 w-36 text-xs" aria-label={`Estado de ${d.title}`}>
                    {Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <button className="btn-ghost px-3 py-1.5">Guardar</button>
                </form>
              ) : <Badge tone={tone}>{label}</Badge>}
            </div>
          );
        })}
      </section>
      {canEdit && (
        <section className="card">
          <h2 className="mb-3 font-bold">Registrar documento</h2>
          <ActionForm action={createDocument}>
            <input type="hidden" name="projectId" value={projectId} />
            <div className="space-y-3">
              <F label="Título" name="title" placeholder="Especificaciones de equipos" />
              <F label="Tipo" name="kind">
                <select id="kind" name="kind" className="input" defaultValue="especificaciones">
                  {Object.entries(KIND).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </F>
            </div>
            <p className="mt-3 text-xs text-mute">La versión sube sola con cada documento nuevo del proyecto.</p>
          </ActionForm>
        </section>
      )}
    </div>
  );
}
