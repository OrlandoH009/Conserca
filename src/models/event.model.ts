import { and, desc, eq } from "drizzle-orm";
import { db, projectEvents } from "@/db";

export type ProjectEvent = typeof projectEvents.$inferSelect;

export const log = (v: typeof projectEvents.$inferInsert) => db.insert(projectEvents).values(v);

/** Últimos movimientos del proyecto; con `onlyClient` solo los que el cliente puede ver. */
export const listByProject = (projectId: number, onlyClient = false, limit = 40) =>
  db
    .select()
    .from(projectEvents)
    .where(onlyClient ? and(eq(projectEvents.projectId, projectId), eq(projectEvents.visibleToClient, true)) : eq(projectEvents.projectId, projectId))
    .orderBy(desc(projectEvents.createdAt), desc(projectEvents.id))
    .limit(limit);
