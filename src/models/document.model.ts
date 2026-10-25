import { desc, eq, max } from "drizzle-orm";
import { db, documents } from "@/db";

export type Document = typeof documents.$inferSelect;
export type DocumentStatus = Document["status"];

export const listByProject = (projectId: number) => db.select().from(documents).where(eq(documents.projectId, projectId)).orderBy(desc(documents.createdAt));
export const lastVersion = async (projectId: number) => {
  const [r] = await db.select({ v: max(documents.version) }).from(documents).where(eq(documents.projectId, projectId));
  return r?.v ?? 0;
};
export const create = (v: typeof documents.$inferInsert) => db.insert(documents).values(v);
export const setStatus = (id: number, status: DocumentStatus) => db.update(documents).set({ status }).where(eq(documents.id, id));
export const countByStatus = (status: DocumentStatus) => db.$count(documents, eq(documents.status, status));
