import * as SupervisionController from "@/controllers/supervision.controller";
import { ActionButton } from "@/components/app/ActionButton";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Badge, Empty } from "@/components/app/ui";
import { fmtDate } from "@/lib/format";
import { addObservation, addVisit, markVisitDone, toggleObservation } from "../../actions";

export async function Supervision({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const { visits, openCount: abiertas } = await SupervisionController.visitsOf(projectId);
  const obsCount = visits.length;

  return (
    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
      <section className="space-y-4">
        <p className="text-sm text-mute">{obsCount} visitas · {abiertas} {abiertas === 1 ? "observación abierta" : "observaciones abiertas"}</p>
        {visits.length === 0 && <div className="card"><Empty>Aún no hay visitas registradas.</Empty></div>}
        {visits.map((v) => {
          const o = v.observations;
          return (
            <article key={v.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="font-bold">{fmtDate(v.visitDate)}</h3><p className="text-sm text-mute">{v.notes}</p></div>
                <div className="flex items-center gap-2">
                  <Badge tone={v.status === "realizada" ? "g" : "b"}>{v.status === "realizada" ? "Realizada" : "Programada"}</Badge>
                  {canEdit && v.status === "programada" && (
                    <ActionButton action={markVisitDone} fields={{ id: v.id, projectId }} okText="Visita marcada como realizada" className="btn-ghost px-3 py-1.5">Marcar realizada</ActionButton>
                  )}
                </div>
              </div>
              {o.length > 0 && (
                <ul className="mt-3 divide-y divide-slate-100">
                  {o.map((x) => (
                    <li key={x.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className={x.status === "cerrada" ? "text-mute line-through" : ""}>{x.text}</span>
                      <span className="flex items-center gap-2">
                        <Badge tone={x.status === "abierta" ? "r" : "g"}>{x.status === "abierta" ? "Abierta" : "Cerrada"}</Badge>
                        {canEdit && (
                          <ActionButton action={toggleObservation} fields={{ id: x.id, projectId, to: x.status === "abierta" ? "cerrada" : "abierta" }} okText={x.status === "abierta" ? "Observación cerrada" : "Observación reabierta"} className="text-xs font-semibold text-accent hover:underline">
                            {x.status === "abierta" ? "Cerrar" : "Reabrir"}
                          </ActionButton>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {canEdit && (
                <ActionForm action={addObservation} submit="Agregar observación" ghost className="mt-3 border-t border-slate-100 pt-3" success="Observación agregada">
                  <input type="hidden" name="projectId" value={projectId} /><input type="hidden" name="visitId" value={v.id} />
                  <input name="text" className="input" placeholder="Nueva observación" required aria-label="Nueva observación" />
                </ActionForm>
              )}
            </article>
          );
        })}
      </section>
      {canEdit && (
        <section className="card self-start">
          <h2 className="mb-3 font-bold">Registrar visita</h2>
          <ActionForm action={addVisit} success="Visita registrada">
            <input type="hidden" name="projectId" value={projectId} />
            <div className="space-y-3">
              <F label="Fecha" name="visitDate" type="date" />
              <F label="Motivo" name="notes" placeholder="Revisión de ductos en nivel 2" />
            </div>
          </ActionForm>
        </section>
      )}
    </div>
  );
}
