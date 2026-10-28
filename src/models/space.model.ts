import { and, eq } from "drizzle-orm";
import { db, spaces } from "@/db";


export const listByProject = (projectId: number) => db.select().from(spaces).where(eq(spaces.projectId, projectId)).orderBy(spaces.id);
export const create = (v: typeof spaces.$inferInsert) => db.insert(spaces).values(v);
const mine = (id: number, projectId: number) => and(eq(spaces.id, id), eq(spaces.projectId, projectId)); // la fila debe ser de ese proyecto
export const remove = (id: number, projectId: number) => db.delete(spaces).where(mine(id, projectId));
export const update = (id: number, projectId: number, v: Omit<typeof spaces.$inferInsert, "id" | "projectId">) => db.update(spaces).set(v).where(mine(id, projectId));
