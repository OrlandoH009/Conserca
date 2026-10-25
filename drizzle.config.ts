import { defineConfig } from "drizzle-kit";

try { process.loadEnvFile(".env"); } catch { /* sin .env, usa el entorno */ }

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "mysql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
