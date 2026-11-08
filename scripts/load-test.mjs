// Prueba de carga: N usuarios virtuales navegando a la vez durante S segundos (solo lecturas, no cambia datos).
// Uso: npm run load:test -- [--url http://localhost:3100] [--users 15] [--seconds 60]
// Entra con una sesión firmada con SESSION_SECRET (no escribe contraseñas), así que mide páginas, base de datos y PDF, no el login.
// Criterio de aprobación: 95 % de las respuestas en menos de 1,5 s y 0 errores.
import mysql from "mysql2/promise";
import { SignJWT } from "jose";
import { loadEnv } from "./_util.mjs";

loadEnv();
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i >= 0 ? process.argv[i + 1] : d; };
const BASE = arg("url", "http://localhost:3100").replace(/\/$/, "");
const USERS = Number(arg("users", 15));
const SECONDS = Number(arg("seconds", 60));
const LIMIT_MS = 1500;

const sql = await mysql.createConnection(process.env.DATABASE_URL);
const [people] = await sql.query("SELECT id, role FROM users WHERE email IN ('admin@conserca.test','ingenieria@conserca.test','dibujo@conserca.test','cliente@conserca.test')");
const [[proj]] = await sql.query("SELECT id FROM projects WHERE archived_at IS NULL ORDER BY id LIMIT 1");
const [docs] = await sql.query("SELECT id FROM documents WHERE file_path IS NOT NULL LIMIT 1");
await sql.end();
if (!people.length || !proj) { console.error("Faltan usuarios de prueba o proyectos en la base."); process.exit(1); }

const key = new TextEncoder().encode(process.env.SESSION_SECRET);
const token = (uid) => new SignJWT({ uid }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(key);
const P = proj.id;
const PAGES = {
  admin: ["/app", "/app/proyectos", `/app/proyectos/${P}?tab=cobros`, `/app/proyectos/${P}?tab=documentos`, `/app/proyectos/${P}?tab=cargas`, `/app/proyectos/${P}?tab=actividad`, "/app/clientes", "/app/calculadoras", "/app/avisos"],
  ingenieria: ["/app", "/app/proyectos", `/app/proyectos/${P}?tab=cargas`, `/app/proyectos/${P}?tab=distribucion`, `/app/proyectos/${P}?tab=supervision`, "/app/catalogo", "/app/calculadoras"],
  dibujo: ["/app", "/app/proyectos", `/app/proyectos/${P}?tab=documentos`, `/app/proyectos/${P}?tab=cargas`],
  usuario: ["/mis-proyectos", "/avisos", "/", "/servicios"],
};
if (docs[0]) { PAGES.admin.push(`/api/documentos/${docs[0].id}`); PAGES.usuario.push("/mis-proyectos"); }

const roles = ["admin", "ingenieria", "dibujo", "usuario"];
const sessions = [];
for (let i = 0; i < USERS; i++) {
  const role = roles[i % roles.length];
  const u = people.find((p) => p.role === role);
  if (u) sessions.push({ role, cookie: `session=${await token(u.id)}` });
}

const samples = []; // { path, ms, ok }
async function visit(s, path) {
  const t0 = performance.now();
  let ok = false;
  try {
    const r = await fetch(BASE + path, { headers: { cookie: s.cookie }, redirect: "follow" });
    await r.arrayBuffer();
    ok = r.status === 200 && !new URL(r.url).pathname.endsWith("/login"); // una redirección al login = sesión rechazada = error
  } catch { /* se cuenta como error */ }
  return { path, ms: performance.now() - t0, ok };
}

// Calentamiento: cada página una vez (en producción la primera visita compila/llena cachés) y no cuenta.
for (const s of sessions.slice(0, 4)) for (const p of PAGES[s.role]) await visit(s, p);

const end = Date.now() + SECONDS * 1000;
const t0 = Date.now();
await Promise.all(sessions.map(async (s) => {
  while (Date.now() < end) {
    const pages = PAGES[s.role];
    samples.push(await visit(s, pages[Math.floor(Math.random() * pages.length)]));
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000)); // pausa humana de 1 a 3 s
  }
}));
const secs = (Date.now() - t0) / 1000;

const pct = (arr, q) => { const a = [...arr].sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(a.length * q))] : 0; };
const fmt = (n) => `${Math.round(n)} ms`.padStart(8);
const byPath = new Map();
for (const s of samples) byPath.set(s.path, [...(byPath.get(s.path) ?? []), s]);
console.log(`\nCarga: ${sessions.length} usuarios simultáneos, ${Math.round(secs)} s, ${BASE}\n`);
console.log("Página".padEnd(46), "veces".padStart(6), "mediana".padStart(9), "p95".padStart(9), "máx".padStart(9), "errores".padStart(8));
for (const [p, rows] of [...byPath].sort((a, b) => pct(b[1].map((x) => x.ms), 0.95) - pct(a[1].map((x) => x.ms), 0.95))) {
  const ms = rows.map((x) => x.ms);
  console.log(p.padEnd(46), String(rows.length).padStart(6), fmt(pct(ms, 0.5)), fmt(pct(ms, 0.95)), fmt(Math.max(...ms)), String(rows.filter((x) => !x.ok).length).padStart(8));
}
const all = samples.map((x) => x.ms);
const errors = samples.filter((x) => !x.ok).length;
const p95 = pct(all, 0.95);
console.log(`\nTotal: ${samples.length} peticiones (${(samples.length / secs).toFixed(1)}/s), mediana ${fmt(pct(all, 0.5)).trim()}, p95 ${fmt(p95).trim()}, máx ${fmt(Math.max(...all)).trim()}, errores ${errors}`);
const pass = p95 < LIMIT_MS && errors === 0;
console.log(pass ? `APRUEBA (p95 < ${LIMIT_MS} ms y 0 errores)` : `NO APRUEBA (se pedía p95 < ${LIMIT_MS} ms y 0 errores)`);
process.exit(pass ? 0 : 1);
