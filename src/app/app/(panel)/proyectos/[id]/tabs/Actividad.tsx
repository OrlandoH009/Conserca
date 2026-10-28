import * as ProjectController from "@/controllers/project.controller";
import { Empty } from "@/components/app/ui";
import { fmtDateTime } from "@/lib/format";

const KIND: Record<string, string> = { estado: "Estado", etapa: "Etapa", avance: "Avance", documento: "Documento", visita: "Visita", revision: "Revisión del cliente", proyecto: "Proyecto", cliente: "Cliente" };

/** Línea de tiempo con todo lo que ha pasado en el proyecto; lo marcado "interno" no lo ve el cliente. */
export async function Actividad({ projectId }: { projectId: number; canEdit: boolean }) {
  const events = await ProjectController.activityOf(projectId);
  return (
    <section className="card max-w-3xl">
      <h2 className="mb-4 font-bold">Actividad del proyecto</h2>
      {events.length === 0 ? <Empty>Aún no hay movimientos registrados.</Empty> : (
        <ol className="relative space-y-5 border-l border-line pl-6">
          {events.map((e) => (
            <li key={e.id} className="relative">
              <span aria-hidden className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-surface" />
              <p className="font-medium">{e.message}</p>
              <p className="text-xs text-mute">{fmtDateTime(e.createdAt)} · {KIND[e.type] ?? e.type}{!e.visibleToClient && " · interno"}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
