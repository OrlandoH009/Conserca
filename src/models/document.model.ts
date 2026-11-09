import { and, eq, isNotNull } from "drizzle-orm";
import { db, documents } from "@/db";

/** Archivos PDF de un proyecto (para borrarlos del disco al eliminar el proyecto). */
export const filesOfProject = async (projectId: number) =>
  (await db.select({ filePath: documents.filePath }).from(documents).where(and(eq(documents.projectId, projectId), isNotNull(documents.filePath)))).map((r) => r.filePath!);
