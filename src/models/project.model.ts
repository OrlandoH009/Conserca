import { and, count, desc, eq, isNotNull, isNull, lt, ne } from "drizzle-orm";
import { clients, db, projects, users } from "@/db";

type Project = typeof projects.$inferSelect;
type ProjectStatus = Project["status"];
export type ProjectChanges = Partial<Omit<typeof projects.$inferInsert, "id" | "createdAt">>;

// `client` = registro de cliente del equipo; `account` = cuenta con la que el cliente entra al sitio.
const withClient = () =>
  db
    .select({ p: projects, client: clients.name, account: users.name })
    .from(projects)
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .leftJoin(users, eq(users.id, projects.clientUserId));

const live = isNull(projects.archivedAt);

export const list = (archived = false) => withClient().where(archived ? isNotNull(projects.archivedAt) : live).orderBy(desc(projects.createdAt));
export const countArchived = () => db.$count(projects, isNotNull(projects.archivedAt));
export const findWithClient = async (id: number) => (await withClient().where(eq(projects.id, id)))[0] ?? null;
export const findById = async (id: number) => (await db.select().from(projects).where(eq(projects.id, id)))[0] ?? null;
export const listRecent = (n: number) => db.select().from(projects).where(live).orderBy(desc(projects.createdAt)).limit(n);
export const options = () => db.select({ id: projects.id, name: projects.name }).from(projects).where(live).orderBy(projects.name);
export const create = async (v: typeof projects.$inferInsert) => (await db.insert(projects).values(v).$returningId())[0].id;
export const update = (id: number, v: ProjectChanges) => db.update(projects).set(v).where(eq(projects.id, id));
export const setStatus = (id: number, status: ProjectStatus) => update(id, { status });
export const setStage = (id: number, stage: string) => update(id, { stage });
export const setProgress = (id: number, progress: number) => update(id, { progress });
export const setClientUser = (id: number, clientUserId: number | null) => update(id, { clientUserId });
export const archive = (id: number, on: boolean) => update(id, { archivedAt: on ? new Date() : null });
export const remove = (id: number) => db.delete(projects).where(eq(projects.id, id));

export const countActive = () => db.$count(projects, and(ne(projects.status, "entregado"), live));
/** Proyectos sin entregar cuya fecha de entrega ya pasó (hoy en formato YYYY-MM-DD). */
export const overdue = (today: string) => db.select().from(projects).where(and(ne(projects.status, "entregado"), live, lt(projects.dueDate, today))).orderBy(projects.dueDate);
export const statusCounts = () => db.select({ status: projects.status, n: count() }).from(projects).where(live).groupBy(projects.status);

export const listByClientUser = (userId: number) => db.select().from(projects).where(and(eq(projects.clientUserId, userId), live)).orderBy(desc(projects.createdAt));
/** Antes de borrar un usuario: sus proyectos se conservan, solo se quita su vínculo (responsable y/o cuenta de cliente). */
export const detachUser = async (userId: number) => {
  await db.update(projects).set({ ownerId: null }).where(eq(projects.ownerId, userId));
  await db.update(projects).set({ clientUserId: null }).where(eq(projects.clientUserId, userId));
};
