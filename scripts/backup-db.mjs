// Respaldo completo: base de datos (mysqldump) + PDF subidos → storage/backups/conserca-AAAAMMDD-HHMMSS.tar.gz
// Uso: npm run db:backup
// Opcional en .env: BACKUP_KEEP=14 (cuántos respaldos locales conservar) y RCLONE_REMOTE=gdrive:Conserca (copia además a Google Drive con rclone).
// Esa carpeta no se sube a git. Para recuperar: docs/RESTAURACION.md
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { dbConn, findBin, loadEnv } from "./_util.mjs";

loadEnv();
const { args, env, db } = dbConn();

const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const dir = path.join("storage", "backups");
mkdirSync(dir, { recursive: true });
const sqlName = `conserca-${stamp}.sql`;
const archive = path.join(dir, `conserca-${stamp}.tar.gz`);

const dump = spawnSync(findBin("mysqldump", "MYSQLDUMP_PATH"), [...args, "--single-transaction", "--routines", "--default-character-set=utf8mb4", "--result-file", path.join(dir, sqlName), db], { env, encoding: "utf8" });
if (dump.status !== 0) { console.error("No se pudo respaldar la base:", dump.stderr || dump.error?.message); process.exit(1); }

// Un solo archivo con la base y los PDF; -C es relativo al anterior (storage/backups → storage).
const hasDocs = existsSync(path.join("storage", "documents"));
const tar = spawnSync("tar", ["-czf", archive, "-C", dir, sqlName, ...(hasDocs ? ["-C", "..", "documents"] : [])], { encoding: "utf8" });
rmSync(path.join(dir, sqlName), { force: true });
if (tar.status !== 0) { console.error("No se pudo comprimir el respaldo:", tar.stderr || tar.error?.message); process.exit(1); }
console.log("Respaldo listo:", archive);

// Se conservan solo los últimos N respaldos locales (el nombre lleva la fecha, así que ordenar el nombre ordena por fecha).
const keep = Math.max(1, Number(process.env.BACKUP_KEEP) || 14);
const all = readdirSync(dir).filter((f) => /^conserca-\d{8}-\d{6}\.tar\.gz$/.test(f)).sort();
for (const old of all.slice(0, Math.max(0, all.length - keep))) rmSync(path.join(dir, old), { force: true });

// Copia externa (Google Drive u otra nube) con rclone, si está configurada. Si falla, el respaldo local queda y el script avisa con error.
const remote = process.env.RCLONE_REMOTE;
if (remote) {
  const up = spawnSync("rclone", ["copy", archive, remote], { encoding: "utf8" });
  if (up.status !== 0) { console.error("El respaldo local está bien, pero NO se pudo copiar a la nube:", up.stderr || up.error?.message); process.exit(2); }
  console.log("Copiado a la nube:", remote);
} else {
  console.log("Aviso: RCLONE_REMOTE no está definido; el respaldo solo está en este servidor.");
}
