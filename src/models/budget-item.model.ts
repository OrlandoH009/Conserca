import { eq } from "drizzle-orm";
import { budgetItems, db } from "@/db";

export type BudgetItem = typeof budgetItems.$inferSelect;

export const listByProject = (projectId: number) => db.select().from(budgetItems).where(eq(budgetItems.projectId, projectId)).orderBy(budgetItems.id);
export const create = (v: typeof budgetItems.$inferInsert) => db.insert(budgetItems).values(v);
export const remove = (id: number) => db.delete(budgetItems).where(eq(budgetItems.id, id));
