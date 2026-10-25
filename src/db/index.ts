import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";
import * as schema from "./schema";

const g = globalThis as unknown as { mysqlPool?: Pool };
const pool = g.mysqlPool ?? createPool({ uri: process.env.DATABASE_URL, connectionLimit: 8, timezone: "Z" });
if (process.env.NODE_ENV !== "production") g.mysqlPool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
export * from "./schema";
