// Restaura un respaldo hecho con backup-db.mjs: la base de datos y los PDF.
// Uso: npm run db:restore -- storage/backups/conserca-AAAAMMDD-HHMMSS.tar.gz --yes [--db otra_base]
// Sin --yes solo muestra qué haría. OJO: REEMPLAZA las tablas de la base y sobrescribe los PDF con el mismo nombre.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, openSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { dbConn, findBin, loadEnv } from "./_util.mjs";

loadEnv();
const argv = process.argv.slice(2);
const dbAt = argv.indexOf("--db");
const dbName = dbAt >= 0 ? argv[dbAt + 1] : undefined;
const file = argv.find((a, i) => !a.startsWith("--") && (dbAt < 0 || i !== dbAt + 1));
if (!file || !existsSync(file)) { console.error("Indica el archivo de respaldo (.tar.gz). Ejemplo: npm run db:restore -- storage/backups/conserca-20261108-120000.tar.gz --yes"); process.exit(1); }
const { args, env, db } = dbConn(dbName);

if (!argv.includes("--yes")) {
  console.log(`Restauraría ${file} en la base «${db}» y copiaría los PDF a storage/documents.\nSi es lo que quieres, repite el comando agregando --yes`);
  process.exit(0);
}

const tmp = mkdtempSync(path.join(os.tmpdir(), "conserca-restore-"));
try {
  const x = spawnSync("tar", ["-xzf", file, "-C", tmp], { encoding: "utf8" });
  if (x.status !== 0) { console.error("No se pudo abrir el respaldo:", x.stderr || x.error?.message); process.exit(1); }
  const sql = readdirSync(tmp).find((f) => f.endsWith(".sql"));
  if (!sql) { console.error("El respaldo no trae el archivo de la base de datos."); process.exit(1); }

  const r = spawnSync(findBin("mysql", "MYSQL_PATH"), [...args, "--default-character-set=utf8mb4", db], { env, encoding: "utf8", stdio: [openSync(path.join(tmp, sql), "r"), "pipe", "pipe"] });
  if (r.status !== 0) { console.error("No se pudo restaurar la base:", r.stderr || r.error?.message); process.exit(1); }
  console.log(`Base «${db}» restaurada.`);

  if (existsSync(path.join(tmp, "documents"))) {
    cpSync(path.join(tmp, "documents"), path.join("storage", "documents"), { recursive: true, force: true });
    console.log("PDF restaurados en storage/documents.");
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
