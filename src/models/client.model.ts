import { desc, eq } from "drizzle-orm";
import { clients, db, projects } from "@/db";

export const list = () => db.select().from(clients).orderBy(desc(clients.createdAt));
export const options = () => db.select({ id: clients.id, name: clients.name }).from(clients).orderBy(clients.name);
export const findById = async (id: number) => (await db.select().from(clients).where(eq(clients.id, id)))[0] ?? null;
export const findByEmail = async (email: string) => (await db.select().from(clients).where(eq(clients.email, email)))[0] ?? null;
export const create = async (v: typeof clients.$inferInsert) => (await db.insert(clients).values(v).$returningId())[0].id;
export const update = (id: number, v: { name: string; contact: string | null; email: string | null; phone: string | null }) => db.update(clients).set(v).where(eq(clients.id, id));
export const remove = (id: number) => db.delete(clients).where(eq(clients.id, id));
export const countProjects = (id: number) => db.$count(projects, eq(projects.clientId, id));
