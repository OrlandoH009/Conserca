// Respaldo de la base de datos con mysqldump → storage/backups/conserca-AAAAMMDD-HHMMSS.sql (esa carpeta no se sube a git).
// Uso: npm run db:backup   (los PDF subidos están aparte, en storage/documents: cópialos junto con este archivo).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

try { process.loadEnvFile(".env"); } catch { /* sin .env, usa el entorno */ }

const raw = process.env.DATABASE_URL;
if (!raw) { console.error("Falta DATABASE_URL en .env"); process.exit(1); }
const url = new URL(raw);

// mysqldump: variable MYSQLDUMP_PATH, la instalación de WampServer o el que esté en el PATH.
function findDump() {
  if (process.env.MYSQLDUMP_PATH) return process.env.MYSQLDUMP_PATH;
  const wamp = "C:/wamp64/bin/mysql";
  if (existsSync(wamp)) {
    for (const d of readdirSync(wamp).sort().reverse()) {
      const p = path.join(wamp, d, "bin", "mysqldump.exe");
      if (existsSync(p)) return p;
    }
  }
  return "mysqldump";
}

const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const dir = path.join("storage", "backups");
mkdirSync(dir, { recursive: true });
const out = path.join(dir, `conserca-${stamp}.sql`);

const r = spawnSync(findDump(), [
  "--host", url.hostname, "--port", url.port || "3306", "--user", decodeURIComponent(url.username),
  "--single-transaction", "--routines", "--default-character-set=utf8mb4", "--result-file", out, url.pathname.slice(1),
], { env: { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) }, encoding: "utf8" }); // la contraseña va por entorno, no por línea de comandos

if (r.status !== 0) { console.error("No se pudo respaldar:", r.stderr || r.error?.message); process.exit(1); }
console.log("Respaldo listo:", out);
