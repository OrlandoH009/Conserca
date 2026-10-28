import { and, eq } from "drizzle-orm";
import { budgetItems, db } from "@/db";


export const listByProject = (projectId: number) => db.select().from(budgetItems).where(eq(budgetItems.projectId, projectId)).orderBy(budgetItems.id);
export const create = (v: typeof budgetItems.$inferInsert) => db.insert(budgetItems).values(v);
const mine = (id: number, projectId: number) => and(eq(budgetItems.id, id), eq(budgetItems.projectId, projectId)); // la fila debe ser de ese proyecto
export const remove = (id: number, projectId: number) => db.delete(budgetItems).where(mine(id, projectId));
export const update = (id: number, projectId: number, v: Omit<typeof budgetItems.$inferInsert, "id" | "projectId">) => db.update(budgetItems).set(v).where(mine(id, projectId));
