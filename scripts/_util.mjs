// Utilidades compartidas por los scripts de respaldo, restauración y disco.
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

export function loadEnv() {
  try { process.loadEnvFile(".env"); } catch { /* sin .env, usa el entorno */ }
}

/** Datos de conexión sacados de DATABASE_URL (la contraseña se pasa por entorno, no por la línea de comandos). */
export function dbConn(dbOverride) {
  const raw = process.env.DATABASE_URL;
  if (!raw) { console.error("Falta DATABASE_URL en .env"); process.exit(1); }
  const url = new URL(raw);
  return {
    args: ["--host", url.hostname, "--port", url.port || "3306", "--user", decodeURIComponent(url.username)],
    env: { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) },
    db: dbOverride || url.pathname.slice(1),
  };
}

/** Programa de MySQL (mysqldump / mysql): variable de entorno, la instalación de WampServer o el que esté en el PATH. */
export function findBin(name, envVar) {
  if (process.env[envVar]) return process.env[envVar];
  const wamp = "C:/wamp64/bin/mysql";
  if (existsSync(wamp)) {
    for (const d of readdirSync(wamp).sort().reverse()) {
      const p = path.join(wamp, d, "bin", `${name}.exe`);
      if (existsSync(p)) return p;
    }
  }
  return name;
}
