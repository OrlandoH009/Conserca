import { desc } from "drizzle-orm";
import { clients, db } from "@/db";

export type Client = typeof clients.$inferSelect;

export const list = () => db.select().from(clients).orderBy(desc(clients.createdAt));
export const options = () => db.select({ id: clients.id, name: clients.name }).from(clients).orderBy(clients.name);
export const create = (v: typeof clients.$inferInsert) => db.insert(clients).values(v);
