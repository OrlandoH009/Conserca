import { desc, eq, ne } from "drizzle-orm";
import { clients, db, projects } from "@/db";

export type Project = typeof projects.$inferSelect;
export type ProjectStatus = Project["status"];

const withClient = () => db.select({ p: projects, client: clients.name }).from(projects).leftJoin(clients, eq(clients.id, projects.clientId));

export const list = () => withClient().orderBy(desc(projects.createdAt));
export const findWithClient = async (id: number) => (await withClient().where(eq(projects.id, id)))[0] ?? null;
export const listRecent = (n: number) => db.select().from(projects).orderBy(desc(projects.createdAt)).limit(n);
export const create = (v: typeof projects.$inferInsert) => db.insert(projects).values(v);
export const setStatus = (id: number, status: ProjectStatus) => db.update(projects).set({ status }).where(eq(projects.id, id));
export const setStage = (id: number, stage: string) => db.update(projects).set({ stage }).where(eq(projects.id, id));
export const countActive = () => db.$count(projects, ne(projects.status, "entregado"));
