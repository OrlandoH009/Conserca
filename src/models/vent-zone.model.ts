import { and, eq } from "drizzle-orm";
import { db, ventZones } from "@/db";


export const listByProject = (projectId: number) => db.select().from(ventZones).where(eq(ventZones.projectId, projectId)).orderBy(ventZones.id);
export const create = (v: typeof ventZones.$inferInsert) => db.insert(ventZones).values(v);
const mine = (id: number, projectId: number) => and(eq(ventZones.id, id), eq(ventZones.projectId, projectId)); // la fila debe ser de ese proyecto
export const remove = (id: number, projectId: number) => db.delete(ventZones).where(mine(id, projectId));
export const update = (id: number, projectId: number, v: Omit<typeof ventZones.$inferInsert, "id" | "projectId">) => db.update(ventZones).set(v).where(mine(id, projectId));
