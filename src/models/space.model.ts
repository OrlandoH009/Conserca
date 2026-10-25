import { eq } from "drizzle-orm";
import { db, spaces } from "@/db";

export type Space = typeof spaces.$inferSelect;

export const listByProject = (projectId: number) => db.select().from(spaces).where(eq(spaces.projectId, projectId)).orderBy(spaces.id);
export const create = (v: typeof spaces.$inferInsert) => db.insert(spaces).values(v);
export const remove = (id: number) => db.delete(spaces).where(eq(spaces.id, id));
