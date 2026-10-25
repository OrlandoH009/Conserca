import { desc, eq } from "drizzle-orm";
import { db, equipment } from "@/db";

export type Equipment = typeof equipment.$inferSelect;

export const list = () => db.select().from(equipment).orderBy(desc(equipment.updatedAt));
export const create = (v: typeof equipment.$inferInsert) => db.insert(equipment).values(v);
export const remove = (id: number) => db.delete(equipment).where(eq(equipment.id, id));
