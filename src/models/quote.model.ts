import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db, quotes } from "@/db";

type Quote = typeof quotes.$inferSelect;
type QuoteStatus = Quote["status"];

const esc = (s: string) => s.replace(/[\\%_]/g, "\\$&"); // los comodines escritos por la persona se buscan tal cual

export async function list(opts: { status?: QuoteStatus; q?: string; page?: number; pageSize?: number } = {}) {
  const size = opts.pageSize ?? 10;
  const page = Math.max(1, opts.page ?? 1);
  const term = opts.q?.trim() ? `%${esc(opts.q.trim())}%` : null;
  const where = and(
    opts.status ? eq(quotes.status, opts.status) : undefined,
    term ? or(like(quotes.name, term), like(quotes.message, term), like(quotes.email, term), like(quotes.phone, term)) : undefined,
  );
  const [{ total }] = await db.select({ total: count() }).from(quotes).where(where);
  const rows = await db.select().from(quotes).where(where).orderBy(desc(quotes.createdAt), desc(quotes.id)).limit(size).offset((page - 1) * size);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / size)) };
}
export const findById = async (id: number) => (await db.select().from(quotes).where(eq(quotes.id, id)))[0] ?? null;
export const create = async (v: typeof quotes.$inferInsert) => (await db.insert(quotes).values(v).$returningId())[0].id;
export const setStatus = (id: number, status: QuoteStatus) => db.update(quotes).set({ status }).where(eq(quotes.id, id));
export const setProject = (id: number, projectId: number) => db.update(quotes).set({ projectId }).where(eq(quotes.id, id));
export const remove = (id: number) => db.delete(quotes).where(eq(quotes.id, id));
export const countByStatus = (status: QuoteStatus) => db.$count(quotes, eq(quotes.status, status));
export const listByUser = (userId: number) => db.select().from(quotes).where(eq(quotes.userId, userId)).orderBy(desc(quotes.createdAt), desc(quotes.id));
