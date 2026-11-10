// Datos de EJEMPLO para probar. Ejecutar con: npm run db:seed (borra y vuelve a crear todo).
try { process.loadEnvFile(".env"); } catch { /* usa el entorno */ }
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { coolingLoad, ventFlow } from "../lib/calc";

// Contraseñas de prueba para uso LOCAL. Cámbialas antes de publicar.
const USERS = [
  { name: "Gerente de Diseño (ejemplo)", email: "admin@conserca.test", password: "Admin-Prueba-2026", role: "admin" },
  { name: "Ing. Diseñador (ejemplo)", email: "ingenieria@conserca.test", password: "Ingenieria-Prueba-2026", role: "ingenieria" },
  { name: "Técnico en Dibujo (ejemplo)", email: "dibujo@conserca.test", password: "Dibujo-Prueba-2026", role: "dibujo" },
  { name: "Usuario de prueba (ejemplo)", email: "cliente@conserca.test", password: "Cliente-Prueba-2026", role: "usuario" }, // ve el proyecto 01 en /mis-proyectos
] as const;

async function main() {
  const d = await import("./index");
  const { db } = d;
  const t = d;
  for (const tbl of [t.notifications, t.projectEvents, t.budgetItems, t.payments, t.documents, t.ventZones, t.airElements, t.spaces, t.projects, t.quotes, t.clients, t.users]) {
    await db.delete(tbl);
  }
  for (const name of ["notifications", "project_events", "budget_items", "payments", "documents", "vent_zones", "air_elements", "spaces", "projects", "quotes", "clients", "users"]) {
    await db.execute(sql.raw("ALTER TABLE " + name + " AUTO_INCREMENT = 1"));
  }

  await db.insert(t.users).values(USERS.map((u) => ({ name: u.name, email: u.email, role: u.role, passwordHash: bcrypt.hashSync(u.password, 10) })));
  const us = await db.select().from(t.users).orderBy(t.users.id);
  const eng = us.find((u) => u.role === "ingenieria")!;
  const cli = us.find((u) => u.role === "usuario")!;

  await db.insert(t.clients).values(["A", "B"].map((x) => ({ name: `Cliente ejemplo ${x}`, contact: `Contacto ejemplo ${x}`, email: `cliente${x.toLowerCase()}@ejemplo.test` })));
  const cl = await db.select().from(t.clients).orderBy(t.clients.id);

  const PR = [
    ["Proyecto ejemplo 01 · Edificio de oficinas", "Oficinas", "Distribución de aire", "en_proceso", "2026-11-15"],
    ["Proyecto ejemplo 02 · Estacionamiento", "Estacionamiento", "Ventilación mecánica", "en_revision", "2026-11-22"],
  ] as const;
  await db.insert(t.projects).values(PR.map((p, i) => ({ name: p[0], spaceType: p[1], stage: p[2], status: p[3], dueDate: p[4], clientId: cl[i % cl.length].id, ownerId: eng.id, progress: [40, 70][i], clientUserId: i === 0 ? cli.id : null })));
  const ps = await db.select().from(t.projects).orderBy(t.projects.id);
  const p1 = ps[0], p2 = ps[1];

  await db.insert(t.projectEvents).values([
    { projectId: p1.id, type: "proyecto", message: "Proyecto creado a partir de tu cotización", createdBy: eng.id },
    { projectId: p1.id, type: "etapa", message: "Etapa: Cargas térmicas", createdBy: eng.id },
    { projectId: p1.id, type: "etapa", message: "Etapa: Distribución de aire", createdBy: eng.id },
    { projectId: p1.id, type: "avance", message: "Avance: 0 % → 40 %", createdBy: eng.id },
    { projectId: p1.id, type: "interno", message: "Revisar caudales del ramal A con ingeniería", visibleToClient: false, createdBy: eng.id },
  ]);
  await db.insert(t.notifications).values({ userId: cli.id, text: "El avance de tu proyecto «Proyecto ejemplo 01 · Edificio de oficinas» es ahora de 40 %.", href: "/mis-proyectos" });

  const spaceRows = [
    { name: "Oficina abierta, nivel 3", areaM2: 240, heightM: 3, usage: "Oficinas", orientation: "sur" as const, people: 32, equipmentW: 6400, lightingWm2: 12 },
    { name: "Sala de juntas", areaM2: 45, heightM: 3, usage: "Oficinas", orientation: "oeste" as const, people: 12, equipmentW: 900, lightingWm2: 14 },
  ];
  await db.insert(t.spaces).values(spaceRows.map((s) => { const r = coolingLoad(s); return { ...s, projectId: p1.id, loadKw: r.kw, loadTr: r.tr }; }));

  await db.insert(t.airElements).values([
    { projectId: p1.id, name: "Conducto principal", kind: "Rectangular", flowM3h: 3800, size: "600 × 300 mm" },
    { projectId: p1.id, name: "Ramal A", kind: "Rectangular", flowM3h: 1400, size: "400 × 250 mm" },
    { projectId: p1.id, name: "Difusor D1", kind: "Difusor", flowM3h: 450, size: "300 × 300 mm" },
    { projectId: p1.id, name: "Rejilla R1", kind: "Retorno", flowM3h: 1350, size: "600 × 300 mm" },
  ]);

  const zones = [
    { projectId: p2.id, kind: "estacionamiento" as const, name: "Sótano 1", areaM2: 1800, heightM: 2.6, ach: 6 },
    { projectId: p2.id, kind: "estacionamiento" as const, name: "Sótano 2", areaM2: 1800, heightM: 2.6, ach: 6 },
    { projectId: p2.id, kind: "sanitarios" as const, name: "Núcleo sanitario", areaM2: 60, heightM: 2.7, ach: 10 },
    { projectId: p2.id, kind: "bodega" as const, name: "Bodega de mantenimiento", areaM2: 90, heightM: 3, ach: 4 },
  ];
  await db.insert(t.ventZones).values([
    ...zones.map((z) => ({ ...z, flowM3h: ventFlow(z) })),
    { projectId: p2.id, kind: "escalera" as const, name: "Escalera de emergencia 1", doors: 2, flowM3h: ventFlow({ kind: "escalera", doors: 2 }) },
  ]);

  await db.insert(t.documents).values([
    { projectId: p1.id, title: "Memoria de cálculo", kind: "memoria", version: 2, status: "en_revision" },
    { projectId: p1.id, title: "Especificaciones técnicas de equipos", kind: "especificaciones", version: 1, status: "en_proceso" },
    { projectId: p1.id, title: "Especificaciones de materiales", kind: "especificaciones", version: 1, status: "en_proceso" },
  ]);

  await db.insert(t.quotes).values({
    name: cli.name, contactMethod: "correo", email: cli.email, userId: cli.id, status: "nueva",
    message: "Tipo de espacio: Oficinas\nServicios: Supervisión",
    details: { space: "Oficinas", services: ["Supervisión"], size: "200 a 1,000 m²", stage: "Obra en curso", when: "En 1 a 3 meses", plans: "Sí, completos", contact: "Correo electrónico", time: "Por la tarde", location: "San Salvador" },
  });

  console.log("Semilla lista. Usuarios de prueba:");
  for (const u of USERS) console.log(` - ${u.role}: ${u.email}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
