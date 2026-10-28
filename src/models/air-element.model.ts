import { and, eq } from "drizzle-orm";
import { airElements, db } from "@/db";


export const listByProject = (projectId: number) => db.select().from(airElements).where(eq(airElements.projectId, projectId)).orderBy(airElements.id);
export const create = (v: typeof airElements.$inferInsert) => db.insert(airElements).values(v);
const mine = (id: number, projectId: number) => and(eq(airElements.id, id), eq(airElements.projectId, projectId)); // la fila debe ser de ese proyecto
export const remove = (id: number, projectId: number) => db.delete(airElements).where(mine(id, projectId));
export const update = (id: number, projectId: number, v: Omit<typeof airElements.$inferInsert, "id" | "projectId">) => db.update(airElements).set(v).where(mine(id, projectId));
