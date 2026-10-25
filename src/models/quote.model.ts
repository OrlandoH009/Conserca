import { desc, eq } from "drizzle-orm";
import { db, quotes } from "@/db";

export type Quote = typeof quotes.$inferSelect;
export type QuoteStatus = Quote["status"];

export const list = () => db.select().from(quotes).orderBy(desc(quotes.createdAt));
export const create = (v: typeof quotes.$inferInsert) => db.insert(quotes).values(v);
export const setStatus = (id: number, status: QuoteStatus) => db.update(quotes).set({ status }).where(eq(quotes.id, id));
export const countByStatus = (status: QuoteStatus) => db.$count(quotes, eq(quotes.status, status));
