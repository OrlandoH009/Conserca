import { eq } from "drizzle-orm";
import { db, ventZones } from "@/db";

export type VentZone = typeof ventZones.$inferSelect;

export const listByProject = (projectId: number) => db.select().from(ventZones).where(eq(ventZones.projectId, projectId)).orderBy(ventZones.id);
export const create = (v: typeof ventZones.$inferInsert) => db.insert(ventZones).values(v);
export const remove = (id: number) => db.delete(ventZones).where(eq(ventZones.id, id));
