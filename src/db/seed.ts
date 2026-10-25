// Datos de EJEMPLO para probar. Ejecutar con: npm run db:seed (borra y vuelve a crear todo).
try { process.loadEnvFile(".env"); } catch { /* usa el entorno */ }
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { coolingLoad, ventFlow } from "../lib/calc";

// Contraseñas de prueba para uso LOCAL. Cámbialas antes de publicar.
const USERS = [
  { name: "Usuario Administración (ejemplo)", email: "admin@conserca.test", password: "Admin-Prueba-2026", role: "admin" },
  { name: "Usuario Ingeniería (ejemplo)", email: "ingenieria@conserca.test", password: "Ingenieria-Prueba-2026", role: "ingenieria" },
  { name: "Usuario Presupuestos (ejemplo)", email: "presupuestos@conserca.test", password: "Presupuestos-Prueba-2026", role: "presupuestos" },
  { name: "Usuario Supervisión (ejemplo)", email: "supervision@conserca.test", password: "Supervision-Prueba-2026", role: "supervision" },
] as const;

async function main() {
  const d = await import("./index");
  const { db } = d;
  const t = d;
  for (const tbl of [t.observations, t.siteVisits, t.budgetItems, t.documents, t.ventZones, t.airElements, t.spaces, t.projects, t.quotes, t.clients, t.equipment, t.users]) {
    await db.delete(tbl);
  }
  for (const name of ["observations", "site_visits", "budget_items", "documents", "vent_zones", "air_elements", "spaces", "projects", "quotes", "clients", "equipment", "users"]) {
    await db.execute(sql.raw("ALTER TABLE " + name + " AUTO_INCREMENT = 1"));
  }

  await db.insert(t.users).values(USERS.map((u) => ({ name: u.name, email: u.email, role: u.role, passwordHash: bcrypt.hashSync(u.password, 10) })));
  const us = await db.select().from(t.users).orderBy(t.users.id);
  const eng = us.find((u) => u.role === "ingenieria")!;
  const sup = us.find((u) => u.role === "supervision")!;

  await db.insert(t.clients).values(["A", "B", "C", "D", "E"].map((x) => ({ name: `Cliente ejemplo ${x}`, contact: `Contacto ejemplo ${x}`, email: `cliente${x.toLowerCase()}@ejemplo.test` })));
  const cl = await db.select().from(t.clients).orderBy(t.clients.id);

  const PR = [
    ["Proyecto ejemplo 01 · Edificio de oficinas", "Oficinas", "Distribución de aire", "en_proceso", "2026-11-15"],
    ["Proyecto ejemplo 02 · Estacionamiento", "Estacionamiento", "Ventilación mecánica", "en_revision", "2026-11-22"],
    ["Proyecto ejemplo 03 · Plaza comercial", "Plaza comercial", "Presupuesto", "en_proceso", "2026-11-30"],
    ["Proyecto ejemplo 04 · Bodega", "Bodega", "Supervisión", "entregado", "2026-12-05"],
    ["Proyecto ejemplo 05 · Torre de oficinas", "Torre de oficinas", "Cargas térmicas", "en_proceso", "2026-12-12"],
    ["Proyecto ejemplo 06 · Hospital", "Hospital", "Escalera presurizada", "atrasado", "2026-10-20"],
  ] as const;
  await db.insert(t.projects).values(PR.map((p, i) => ({ name: p[0], spaceType: p[1], stage: p[2], status: p[3], dueDate: p[4], clientId: cl[i % cl.length].id, ownerId: i === 3 ? sup.id : eng.id })));
  const ps = await db.select().from(t.projects).orderBy(t.projects.id);
  const p1 = ps[0], p2 = ps[1], p3 = ps[2], p4 = ps[3];

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
    { projectId: p3.id, title: "Presupuesto estimado de obra", kind: "presupuesto", version: 1, status: "entregado" },
  ]);

  await db.insert(t.budgetItems).values([
    { projectId: p3.id, description: "Equipo de aire acondicionado (ejemplo)", unit: "pza", quantity: 2, unitPrice: 180000 },
    { projectId: p3.id, description: "Conducto metálico", unit: "m²", quantity: 420, unitPrice: 850 },
    { projectId: p3.id, description: "Difusores y rejillas", unit: "pza", quantity: 48, unitPrice: 1200 },
    { projectId: p3.id, description: "Extractores de estacionamiento", unit: "pza", quantity: 6, unitPrice: 38000 },
    { projectId: p3.id, description: "Sistema de presurización de escalera", unit: "lote", quantity: 1, unitPrice: 210000 },
  ]);

  await db.insert(t.siteVisits).values([
      { projectId: p4.id, visitDate: "2026-10-15", notes: "Inicio de obra", status: "realizada" },
      { projectId: p4.id, visitDate: "2026-10-29", notes: "Equipos en azotea", status: "realizada" },
      { projectId: p4.id, visitDate: "2026-11-12", notes: "Revisión de ductos en nivel 2", status: "programada" },
    ]);
  const vs = await db.select().from(t.siteVisits).orderBy(t.siteVisits.id);
  await db.insert(t.observations).values([
    { visitId: vs[1].id, text: "El conducto del ramal A no coincide con la medida del plano.", status: "abierta" },
    { visitId: vs[1].id, text: "Falta soporte en tramo principal.", status: "abierta" },
    { visitId: vs[1].id, text: "Equipo instalado conforme a especificación.", status: "cerrada" },
  ]);

  await db.insert(t.equipment).values([
    { name: "Equipo tipo paquete (ejemplo)", category: "Equipos", capacity: "10 TR", brand: "Marca ejemplo" },
    { name: "Extractor axial (ejemplo)", category: "Extractores", capacity: "12,000 m³/h", brand: "Marca ejemplo" },
    { name: "Conducto de lámina galvanizada", category: "Conductos", capacity: "Calibre 24" },
    { name: "Difusor de 4 vías", category: "Rejillas y difusores", capacity: "300 × 300 mm" },
    { name: "Rejilla de retorno", category: "Rejillas y difusores", capacity: "600 × 300 mm" },
    { name: "Ventilador de presurización", category: "Extractores", capacity: "9,800 m³/h", brand: "Marca ejemplo" },
  ]);

  await db.insert(t.quotes).values([
    { name: "Persona ejemplo 1", contactMethod: "correo", email: "persona1@ejemplo.test", message: "Necesito el diseño de aire acondicionado de un edificio de oficinas.", status: "nueva" },
    { name: "Persona ejemplo 2", contactMethod: "telefono", phone: "+52 55 0000 0000", message: "Ventilación de un estacionamiento de 3 niveles.", status: "nueva" },
    { name: "Persona ejemplo 3", contactMethod: "correo", email: "persona3@ejemplo.test", message: "Supervisión de obra de un sistema ya diseñado.", status: "en_proceso" },
  ]);

  console.log("Semilla lista. Usuarios de prueba:");
  for (const u of USERS) console.log(` - ${u.role}: ${u.email}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
