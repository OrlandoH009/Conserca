import * as DocumentModel from "@/models/document.model";
import * as EventModel from "@/models/event.model";
import * as ProjectModel from "@/models/project.model";
import * as VisitModel from "@/models/visit.model";

/**
 * Lo que ve un cliente de sus proyectos: PDF disponibles, visitas de supervisión, conteo de observaciones (sin su texto interno)
 * y los movimientos que el equipo marcó como visibles para él.
 */
export async function projectsOf(userId: number) {
  const list = await ProjectModel.listByClientUser(userId);
  return Promise.all(
    list.map(async (p) => {
      const [docs, visits, events] = await Promise.all([DocumentModel.listByProject(p.id), VisitModel.listByProject(p.id), EventModel.listByProject(p.id, true, 8)]);
      const obs = await VisitModel.observationsFor(visits.map((v) => v.id));
      return {
        p,
        docs: docs.filter((d) => d.filePath),
        visits,
        events,
        open: obs.filter((o) => o.status === "abierta").length,
        closed: obs.filter((o) => o.status === "cerrada").length,
      };
    }),
  );
}

export const projectCount = async (userId: number) => (await ProjectModel.listByClientUser(userId)).length;
