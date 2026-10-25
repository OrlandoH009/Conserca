import { eq } from "drizzle-orm";
import { db, users } from "@/db";

export type User = typeof users.$inferSelect;
export type Role = User["role"];

// Nunca se devuelve el hash de la contraseña salvo en findByEmail (lo necesita el login).
const safe = { id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role };

export const findPublicById = async (id: number) => (await db.select(safe).from(users).where(eq(users.id, id)))[0] ?? null;
export const findByEmail = async (email: string) => (await db.select().from(users).where(eq(users.email, email)))[0] ?? null;
export const listPublic = () => db.select(safe).from(users).orderBy(users.id);
export const create = (v: typeof users.$inferInsert) => db.insert(users).values(v);
export const setRole = (id: number, role: Role) => db.update(users).set({ role }).where(eq(users.id, id));
export const findWithHash = async (id: number) => (await db.select().from(users).where(eq(users.id, id)))[0] ?? null;
export const updateProfile = (id: number, v: { name: string; phone: string | null }) => db.update(users).set(v).where(eq(users.id, id));
export const setPassword = (id: number, passwordHash: string) => db.update(users).set({ passwordHash }).where(eq(users.id, id));
