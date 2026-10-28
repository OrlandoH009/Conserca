import { and, desc, eq, isNull } from "drizzle-orm";
import { db, notifications } from "@/db";

export type Notification = typeof notifications.$inferSelect;

export const create = (v: typeof notifications.$inferInsert) => db.insert(notifications).values(v);
export const createMany = (rows: (typeof notifications.$inferInsert)[]) => (rows.length ? db.insert(notifications).values(rows) : Promise.resolve());
export const listFor = (userId: number, limit = 50) => db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt), desc(notifications.id)).limit(limit);
export const countUnread = (userId: number) => db.$count(notifications, and(eq(notifications.userId, userId), isNull(notifications.readAt)));
export const markAllRead = (userId: number) => db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
