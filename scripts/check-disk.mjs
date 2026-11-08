// Aviso de disco lleno. Uso: npm run disk:check   (programarlo cada hora; ver docs/RESTAURACION.md)
// Si el disco pasa del umbral (DISK_ALERT_PCT, 80 por defecto) avisa en la campana del panel a los Gerentes (máx. 1 aviso al día) y termina con código 2.
import { statfsSync } from "node:fs";
import mysql from "mysql2/promise";
import { loadEnv } from "./_util.mjs";

loadEnv();
const limit = Number(process.env.DISK_ALERT_PCT) || 80;
const s = statfsSync(process.env.DISK_PATH || process.cwd());
const used = Math.round((1 - s.bavail / s.blocks) * 100);
const freeGB = ((s.bavail * s.bsize) / 1024 ** 3).toFixed(1);
console.log(`Disco: ${used} % usado, ${freeGB} GB libres (umbral ${limit} %).`);
if (used < limit) process.exit(0);

const text = `El disco del servidor está al ${used} % (quedan ${freeGB} GB). Borra respaldos viejos o amplía el disco.`;
console.error("ALERTA:", text);
try {
  const c = await mysql.createConnection(process.env.DATABASE_URL);
  const [admins] = await c.query("SELECT id FROM users WHERE role = 'admin'");
  for (const { id } of admins) {
    const [recent] = await c.query("SELECT id FROM notifications WHERE user_id = ? AND text LIKE 'El disco del servidor%' AND created_at > NOW() - INTERVAL 1 DAY LIMIT 1", [id]);
    if (!recent.length) await c.query("INSERT INTO notifications (user_id, text, href) VALUES (?, ?, '/app')", [id, text]);
  }
  await c.end();
} catch (e) {
  console.error("No se pudo dejar el aviso en el sistema:", e.message);
}
process.exit(2);
