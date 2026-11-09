import * as EventModel from "@/models/event.model";
import * as ProjectModel from "@/models/project.model";

/** Lo que ve un cliente de sus proyectos: avance, etapa, fechas y los movimientos que el equipo marcó como visibles para él. */
export async function projectsOf(userId: number) {
  const list = await ProjectModel.listByClientUser(userId);
  return Promise.all(list.map(async (p) => ({ p, events: await EventModel.listByProject(p.id, true, 8) })));
}

export const projectCount = async (userId: number) => (await ProjectModel.listByClientUser(userId)).length;
