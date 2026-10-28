import { and, desc, eq, isNotNull, max } from "drizzle-orm";
import { db, documents, projects } from "@/db";

type Document = typeof documents.$inferSelect;
type DocumentStatus = Document["status"];
type ClientStatus = Document["clientStatus"];

export const listByProject = (projectId: number) => db.select().from(documents).where(eq(documents.projectId, projectId)).orderBy(desc(documents.createdAt), desc(documents.id));
export const findById = async (id: number) => (await db.select().from(documents).where(eq(documents.id, id)))[0] ?? null;
/** Última versión de un documento con ese título en el proyecto (el título agrupa las versiones). */
export const lastVersion = async (projectId: number, title: string) => {
  const [r] = await db.select({ v: max(documents.version) }).from(documents).where(and(eq(documents.projectId, projectId), eq(documents.title, title)));
  return r?.v ?? 0;
};
export const create = async (v: typeof documents.$inferInsert) => (await db.insert(documents).values(v).$returningId())[0].id;
export const setStatus = (id: number, status: DocumentStatus) => db.update(documents).set({ status }).where(eq(documents.id, id));
export const setReview = (id: number, clientStatus: ClientStatus, clientComment: string | null) =>
  db.update(documents).set({ clientStatus, clientComment, reviewedAt: new Date() }).where(eq(documents.id, id));
export const remove = (id: number) => db.delete(documents).where(eq(documents.id, id));
export const countByStatus = (status: DocumentStatus) => db.$count(documents, eq(documents.status, status));
/** Archivos PDF de un proyecto (para borrarlos del disco al eliminar el proyecto). */
export const filesOfProject = async (projectId: number) =>
  (await db.select({ filePath: documents.filePath }).from(documents).where(and(eq(documents.projectId, projectId), isNotNull(documents.filePath)))).map((r) => r.filePath!);
/** Un documento con los datos de su proyecto: sirve para decidir quién puede verlo y a quién avisar. */
export const findWithOwner = async (id: number) =>
  (
    await db
      .select({ doc: documents, clientUserId: projects.clientUserId, ownerId: projects.ownerId, projectId: projects.id, projectName: projects.name })
      .from(documents)
      .innerJoin(projects, eq(projects.id, documents.projectId))
      .where(eq(documents.id, id))
  )[0] ?? null;
