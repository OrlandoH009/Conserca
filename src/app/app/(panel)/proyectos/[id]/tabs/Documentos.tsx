import Link from "next/link";
import * as DocumentController from "@/controllers/document.controller";
import { ActionButton } from "@/components/app/ActionButton";
import { ActionForm, F } from "@/components/app/ActionForm";
import { AutoSelect } from "@/components/app/AutoSelect";
import { EditDialog } from "@/components/app/EditDialog";
import { PdfInput } from "@/components/app/PdfInput";
import { Badge, Empty } from "@/components/app/ui";
import { fmtDateTime } from "@/lib/format";
import { fmtMB } from "@/lib/pdf";
import { createDocument, removeDocument, setDocumentStatus } from "../../actions";

const STATUS = { en_proceso: ["En proceso", "b"], en_revision: ["En revisión", "a"], entregado: ["Entregado", "g"] } as const;
const KIND = { memoria: "Memoria de cálculo", especificaciones: "Especificaciones", presupuesto: "Presupuesto" } as const;
const REVIEW = { aprobado: ["Aprobado por el cliente", "g"], cambios: ["El cliente pidió cambios", "r"] } as const;

/** Formulario para registrar un documento. Con el mismo título que uno existente, queda como su siguiente versión. */
function DocForm({ projectId, defaults }: { projectId: number; defaults?: { title: string; kind: string } }) {
  return (
    <ActionForm action={createDocument} submit={defaults ? "Subir nueva versión" : "Guardar"} success={defaults ? "Nueva versión registrada" : "Documento registrado"}>
      <input type="hidden" name="projectId" value={projectId} />
      <div className="space-y-3">
        <F label="Título" name="title" placeholder="Especificaciones de equipos" defaultValue={defaults?.title} />
        <F label="Tipo" name="kind">
          <select key={defaults?.kind} id="kind" name="kind" className="input" defaultValue={defaults?.kind ?? "especificaciones"}>
            {Object.entries(KIND).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </F>
        <F label="PDF (opcional)" name="file" required={false}><PdfInput /></F>
      </div>
      <p className="mt-3 text-xs text-mute">Si repites el título de un documento, se registra como su siguiente versión. Si adjuntas un PDF, el cliente lo ve en su cuenta.</p>
    </ActionForm>
  );
}

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
          const review = d.clientStatus !== "pendiente" ? REVIEW[d.clientStatus] : null;
          return (
            <div key={d.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
              <div className="min-w-0">
                <p className="font-semibold">{d.title}</p>
                <p className="text-sm text-mute">{KIND[d.kind as keyof typeof KIND] ?? d.kind} · versión {d.version} · {fmtDateTime(d.createdAt)}{d.fileSize ? ` · ${fmtMB(d.fileSize)}` : ""}</p>
                {d.filePath ? (
                  <a href={`/api/documentos/${d.id}`} target="_blank" className="text-sm font-semibold text-accent hover:underline">📄 {d.fileName}</a>
                ) : <p className="text-xs text-mute">Sin PDF todavía: el cliente aún no lo ve.</p>}
                {review && (
                  <p className="mt-1 text-sm">
                    <Badge tone={review[1]}>{review[0]}</Badge>
                    {d.clientComment && <span className="ml-2 text-mute">«{d.clientComment}»</span>}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {canEdit ? (
                  <>
                    <AutoSelect
                      key={d.status}
                      name="status"
                      value={d.status}
                      options={Object.entries(STATUS).map(([k, [l]]) => [k, l])}
                      action={setDocumentStatus}
                      fields={{ id: d.id, projectId }}
                      label={`Estado de ${d.title}`}
                      okText="Estado del documento actualizado"
                      className="input h-9 w-36 text-xs"
                    />
                    <EditDialog label="Nueva versión" title={`Nueva versión de «${d.title}»`} className="text-sm font-semibold text-accent hover:underline">
                      <DocForm projectId={projectId} defaults={{ title: d.title, kind: d.kind }} />
                    </EditDialog>
                    <ActionButton action={removeDocument} fields={{ id: d.id, projectId }} confirm={`¿Eliminar «${d.title}» (versión ${d.version})? Se borra también su PDF y no se puede deshacer.`} okText="Documento eliminado" className="text-sm font-semibold text-red-600 hover:underline">Eliminar</ActionButton>
                  </>
                ) : <Badge tone={tone}>{label}</Badge>}
              </div>
            </div>
          );
        })}
      </section>
      {canEdit && (
        <section className="card self-start">
          <h2 className="mb-3 font-bold">Registrar documento</h2>
          <DocForm projectId={projectId} />
        </section>
      )}
    </div>
  );
}
