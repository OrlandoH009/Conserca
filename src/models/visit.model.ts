import { asc, desc, eq, inArray } from "drizzle-orm";
import { db, observations, projects, siteVisits } from "@/db";

export type Visit = typeof siteVisits.$inferSelect;
export type Observation = typeof observations.$inferSelect;
export type ObservationStatus = Observation["status"];

export const listByProject = (projectId: number) => db.select().from(siteVisits).where(eq(siteVisits.projectId, projectId)).orderBy(desc(siteVisits.visitDate));
export const findById = async (id: number) => (await db.select().from(siteVisits).where(eq(siteVisits.id, id)))[0] ?? null;
export const create = (v: typeof siteVisits.$inferInsert) => db.insert(siteVisits).values(v);
export const markDone = (id: number) => db.update(siteVisits).set({ status: "realizada" }).where(eq(siteVisits.id, id));
export const countScheduled = () => db.$count(siteVisits, eq(siteVisits.status, "programada"));

export const upcoming = (limit: number) =>
  db
    .select({ id: siteVisits.id, date: siteVisits.visitDate, notes: siteVisits.notes, projectId: projects.id, project: projects.name })
    .from(siteVisits)
    .innerJoin(projects, eq(projects.id, siteVisits.projectId))
    .where(eq(siteVisits.status, "programada"))
    .orderBy(asc(siteVisits.visitDate))
    .limit(limit);

export const observationsFor = async (visitIds: number[]) =>
  visitIds.length ? db.select().from(observations).where(inArray(observations.visitId, visitIds)).orderBy(observations.id) : [];
export const createObservation = (v: typeof observations.$inferInsert) => db.insert(observations).values(v);
export const setObservationStatus = (id: number, status: ObservationStatus) => db.update(observations).set({ status }).where(eq(observations.id, id));
