import { boolean, date, double, int, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import type { QuoteDetails } from "../lib/quote-details"; // relativo: drizzle-kit no resuelve el alias @/

const id = () => int("id").autoincrement().primaryKey();
const createdAt = () => timestamp("created_at").defaultNow().notNull();

export const users = mysqlTable("users", {
  id: id(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 190 }).notNull().unique(),
  phone: varchar("phone", { length: 40 }),
  passwordHash: varchar("password_hash", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).$type<"admin" | "ingenieria" | "presupuestos" | "supervision" | "usuario">().notNull(),
  createdAt: createdAt(),
});

export const clients = mysqlTable("clients", {
  id: id(),
  name: varchar("name", { length: 150 }).notNull(),
  contact: varchar("contact", { length: 150 }),
  email: varchar("email", { length: 190 }),
  phone: varchar("phone", { length: 40 }),
  createdAt: createdAt(),
});

export const quotes = mysqlTable("quotes", {
  id: id(),
  name: varchar("name", { length: 150 }).notNull(),
  contactMethod: varchar("contact_method", { length: 20 }).$type<"correo" | "telefono">().notNull(),
  email: varchar("email", { length: 200 }),
  phone: varchar("phone", { length: 40 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).$type<"nueva" | "en_proceso" | "respondida">().notNull().default("nueva"),
  userId: int("user_id").references(() => users.id, { onDelete: "set null" }), // cuenta que la envió (cotización personalizada)
  projectId: int("project_id").references(() => projects.id, { onDelete: "set null" }), // proyecto creado a partir de ella
  details: json("details").$type<QuoteDetails>(), // opciones elegidas, para mostrarlas ordenadas
  createdAt: createdAt(),
});

export const projects = mysqlTable("projects", {
  id: id(),
  name: varchar("name", { length: 200 }).notNull(),
  clientId: int("client_id").references(() => clients.id),
  clientUserId: int("client_user_id").references(() => users.id), // cuenta del cliente que ve el avance en /mis-proyectos
  progress: int("progress").notNull().default(0), // porcentaje de avance, lo actualiza el equipo
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  archivedAt: timestamp("archived_at"), // archivado: no sale en la lista normal
  spaceType: varchar("space_type", { length: 100 }).notNull(),
  stage: varchar("stage", { length: 100 }).notNull().default("Cargas térmicas"),
  status: varchar("status", { length: 20 }).$type<"en_proceso" | "en_revision" | "entregado" | "atrasado">().notNull().default("en_proceso"),
  ownerId: int("owner_id").references(() => users.id),
  dueDate: date("due_date", { mode: "string" }),
  createdAt: createdAt(),
});

const projectRef = () => int("project_id").notNull().references(() => projects.id, { onDelete: "cascade" });

export const spaces = mysqlTable("spaces", {
  id: id(),
  projectId: projectRef(),
  name: varchar("name", { length: 200 }).notNull(),
  areaM2: double("area_m2").notNull(),
  heightM: double("height_m").notNull(),
  usage: varchar("usage_type", { length: 100 }).notNull(),
  orientation: varchar("orientation", { length: 10 }).$type<"norte" | "sur" | "este" | "oeste">().notNull(),
  people: int("people").notNull(),
  equipmentW: double("equipment_w").notNull(),
  lightingWm2: double("lighting_wm2").notNull(),
  loadKw: double("load_kw").notNull(),
  loadTr: double("load_tr").notNull(),
});

export const airElements = mysqlTable("air_elements", {
  id: id(),
  projectId: projectRef(),
  name: varchar("name", { length: 200 }).notNull(),
  kind: varchar("kind", { length: 100 }).notNull(),
  flowM3h: double("flow_m3h").notNull(),
  size: varchar("size", { length: 100 }).notNull(),
});

export const ventZones = mysqlTable("vent_zones", {
  id: id(),
  projectId: projectRef(),
  kind: varchar("kind", { length: 20 }).$type<"estacionamiento" | "sanitarios" | "escalera" | "bodega">().notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  areaM2: double("area_m2"),
  heightM: double("height_m"),
  ach: double("ach"),
  doors: int("doors"),
  flowM3h: double("flow_m3h").notNull(),
});

export const documents = mysqlTable("documents", {
  id: id(),
  projectId: projectRef(),
  title: varchar("title", { length: 200 }).notNull(),
  kind: varchar("kind", { length: 30 }).notNull(),
  version: int("version").notNull().default(1),
  status: varchar("status", { length: 20 }).$type<"en_proceso" | "en_revision" | "entregado">().notNull().default("en_proceso"),
  fileName: varchar("file_name", { length: 200 }), // PDF subido (nombre original)
  filePath: varchar("file_path", { length: 60 }), // nombre generado en storage/documents
  fileSize: int("file_size"), // bytes del PDF
  clientStatus: varchar("client_status", { length: 20 }).$type<"pendiente" | "aprobado" | "cambios">().notNull().default("pendiente"), // revisión del cliente
  clientComment: varchar("client_comment", { length: 500 }),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: createdAt(),
});

export const budgetItems = mysqlTable("budget_items", {
  id: id(),
  projectId: projectRef(),
  description: varchar("description", { length: 300 }).notNull(),
  unit: varchar("unit", { length: 30 }).notNull(),
  quantity: double("quantity").notNull(),
  unitPrice: double("unit_price").notNull(),
});

export const siteVisits = mysqlTable("site_visits", {
  id: id(),
  projectId: projectRef(),
  visitDate: date("visit_date", { mode: "string" }).notNull(),
  notes: varchar("notes", { length: 300 }).notNull(),
  status: varchar("status", { length: 20 }).$type<"programada" | "realizada">().notNull().default("programada"),
});

export const observations = mysqlTable("observations", {
  id: id(),
  visitId: int("visit_id").notNull().references(() => siteVisits.id, { onDelete: "cascade" }),
  text: varchar("text", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).$type<"abierta" | "cerrada">().notNull().default("abierta"),
});

export const equipment = mysqlTable("equipment", {
  id: id(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  capacity: varchar("capacity", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull().default("Genérico"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Registro de lo que pasa en un proyecto; `visibleToClient` decide si el cliente lo ve en su línea de tiempo.
export const projectEvents = mysqlTable("project_events", {
  id: id(),
  projectId: projectRef(),
  type: varchar("type", { length: 30 }).notNull(), // estado, etapa, avance, documento, visita, revision, proyecto
  message: varchar("message", { length: 300 }).notNull(),
  visibleToClient: boolean("visible_to_client").notNull().default(true),
  createdBy: int("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

// Avisos dentro del sistema (sin correo): campanita con contador.
export const notifications = mysqlTable("notifications", {
  id: id(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: varchar("text", { length: 300 }).notNull(),
  href: varchar("href", { length: 200 }),
  readAt: timestamp("read_at"),
  createdAt: createdAt(),
});
