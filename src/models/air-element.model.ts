import { eq } from "drizzle-orm";
import { airElements, db } from "@/db";

export type AirElement = typeof airElements.$inferSelect;

export const listByProject = (projectId: number) => db.select().from(airElements).where(eq(airElements.projectId, projectId)).orderBy(airElements.id);
export const create = (v: typeof airElements.$inferInsert) => db.insert(airElements).values(v);
export const remove = (id: number) => db.delete(airElements).where(eq(airElements.id, id));
