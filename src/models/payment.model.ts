import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { db, payments, projects } from "@/db";

export type PaymentChanges = Partial<Omit<typeof payments.$inferInsert, "id" | "projectId" | "createdAt">>;

export const listByProject = (projectId: number) => db.select().from(payments).where(eq(payments.projectId, projectId)).orderBy(asc(payments.dueProgress), asc(payments.id));
export const createMany = (v: (typeof payments.$inferInsert)[]) => db.insert(payments).values(v);
export const find = async (id: number, projectId: number) => (await db.select().from(payments).where(and(eq(payments.id, id), eq(payments.projectId, projectId))))[0] ?? null;
const mine = (id: number, projectId: number) => and(eq(payments.id, id), eq(payments.projectId, projectId)); // la fila debe ser de ese proyecto
export const update = (id: number, projectId: number, v: PaymentChanges) => db.update(payments).set(v).where(mine(id, projectId));
export const remove = (id: number, projectId: number) => db.delete(payments).where(mine(id, projectId));

/** Cobros que aún no se cobran (pendientes o facturados) de proyectos vigentes, con el avance del proyecto. */
export const open = () =>
  db
    .select({ pay: payments, projectId: projects.id, projectName: projects.name, progress: projects.progress, projectStatus: projects.status })
    .from(payments)
    .innerJoin(projects, eq(projects.id, payments.projectId))
    .where(and(ne(payments.status, "cobrado"), isNull(projects.archivedAt)))
    .orderBy(asc(projects.name), asc(payments.dueProgress));
