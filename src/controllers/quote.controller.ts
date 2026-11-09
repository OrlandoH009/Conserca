import { z } from "zod";
import { parse, UserError } from "@/lib/action-utils";
import { assertAccess, currentUser, requireAccess } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { limited } from "@/lib/rate-limit";
import { CONTACTS, DETAIL_MAX, PLANS, SIZES, SPACE_TYPES, STAGES as QUOTE_STAGES, TIMES, WHEN } from "@/lib/quote-options";
import type { QuoteDetails } from "@/lib/quote-details";
import { SERVICES } from "@/lib/services";
import { STAGES } from "@/lib/stages";
import * as ActivityController from "./activity.controller";
import * as PaymentController from "./payment.controller";
import * as ClientModel from "@/models/client.model";
import * as NotificationModel from "@/models/notification.model";
import * as ProjectModel from "@/models/project.model";
import * as QuoteModel from "@/models/quote.model";

export type PublicQuoteResult = { ok?: boolean; error?: string };

// Las cuentas del equipo (Gerente, Ing. Diseñador, Técnico) reciben cotizaciones, no las piden.
const TEAM_ERROR = "Las cuentas del equipo no solicitan cotizaciones.";

const one = <T extends readonly [string, ...string[]]>(opts: T, msg: string) => z.enum(opts, { error: msg });
const QuoteSchema = z.object({
  space: one(SPACE_TYPES, "Elige el tipo de espacio"),
  services: z.array(one(SERVICES.map((x) => x.title) as [string, ...string[]], "Servicio no válido")).min(1, "Elige al menos un servicio"),
  size: one(SIZES, "Elige el tamaño aproximado"),
  stage: one(QUOTE_STAGES, "Elige en qué etapa va tu proyecto"),
  when: one(WHEN, "Elige para cuándo lo necesitas"),
  contact: one(CONTACTS, "Elige cómo prefieres que te contactemos"),
  time: one(TIMES, "Elige en qué horario te contactamos"),
  plans: one(PLANS, "Cuéntanos si ya tienes planos"),
  location: z.string().trim().max(150, "La ubicación es muy larga").optional(),
  detail: z.string().trim().max(DETAIL_MAX, "El detalle es muy largo").optional(),
});

/** Cotización personalizada: solo con cuenta. Nombre, correo y teléfono salen de la cuenta; el formulario es de opciones. */
export async function submitPublic(fd: FormData): Promise<PublicQuoteResult> {
  const me = await currentUser();
  if (!me) return { error: "Inicia sesión o regístrate para cotizar" };
  if (me.role !== "usuario") return { error: TEAM_ERROR };
  if (await limited("quote", 10, 60 * 60_000)) return { error: "Demasiados intentos. Espera unos minutos." };

  const parsed = QuoteSchema.safeParse({
    space: fd.get("space") ?? undefined,
    services: fd.getAll("services").map(String),
    size: fd.get("size") ?? undefined,
    stage: fd.get("stage") ?? undefined,
    when: fd.get("when") ?? undefined,
    contact: fd.get("contact") ?? undefined,
    time: fd.get("time") ?? undefined,
    plans: fd.get("plans") ?? undefined,
    location: String(fd.get("location") ?? ""),
    detail: String(fd.get("detail") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const v = parsed.data;
  const details: QuoteDetails = { ...v, location: v.location || undefined, detail: v.detail || undefined };
  const message = [
    `Tipo de espacio: ${v.space}`,
    `Servicios: ${v.services.join(", ")}`,
    `Tamaño aproximado: ${v.size}`,
    `Etapa: ${v.stage}`,
    `Cuándo lo necesita: ${v.when}`,
    ...(v.location ? [`Ubicación: ${v.location}`] : []),
    `¿Tiene planos?: ${v.plans}`,
    `Contacto preferido: ${v.contact}, ${v.time.toLowerCase()}`,
    ...(v.detail ? ["", `Detalle: ${v.detail}`] : []),
  ].join("\n");
  await QuoteModel.create({
    name: me.name,
    contactMethod: v.contact === CONTACTS[0] && me.phone ? "telefono" : "correo",
    email: me.email,
    phone: me.phone,
    message,
    userId: me.id,
    details,
  });
  await ActivityController.notifyStaff("clientes", `Nueva cotización personalizada de ${me.name}`, "/app/clientes");
  return { ok: true };
}

const PHONE = /^[+\d][\d\s().-]{6,}$/;

/** Cotización básica sin cuenta: nombre, teléfono y texto libre. Sin sesión, así que solo valida y guarda. */
export async function submitQuick(fd: FormData): Promise<PublicQuoteResult> {
  if (fd.get("website")) return { ok: true }; // campo trampa para bots
  const me = await currentUser();
  if (me) return { error: me.role === "usuario" ? "Ya iniciaste sesión: usa la cotización personalizada de tu cuenta." : TEAM_ERROR };
  if (await limited("quick", 5, 60 * 60_000)) return { error: "Demasiados intentos. Espera unos minutos." };
  const p = z
    .object({
      name: z.string().trim().min(2, "Escribe tu nombre").max(120),
      phone: z.string().trim().regex(PHONE, "Escribe un teléfono o WhatsApp válido").max(40),
      message: z.string().trim().min(10, "Cuéntanos un poco más de lo que necesitas").max(DETAIL_MAX, "El texto es muy largo"),
    })
    .safeParse({ name: String(fd.get("name") ?? ""), phone: String(fd.get("phone") ?? ""), message: String(fd.get("message") ?? "") });
  if (!p.success) return { error: p.error.issues[0].message };
  await QuoteModel.create({ ...p.data, contactMethod: "telefono" });
  await ActivityController.notifyStaff("clientes", `Nueva cotización rápida de ${p.data.name}`, "/app/clientes");
  return { ok: true };
}

const STATUSES = ["nueva", "en_proceso", "respondida", "aceptada", "rechazada"] as const;
const quoteId = z.coerce.number().int().positive();

/** Cotizaciones con filtro por estado, búsqueda y paginación (para el panel). */
export async function list(filters: { estado?: string; q?: string; page?: number }) {
  await requireAccess("clientes");
  return QuoteModel.list({ status: STATUSES.find((s) => s === filters.estado), q: filters.q, page: filters.page, pageSize: 10 });
}

/** Cotizaciones enviadas por la cuenta con sesión (para "Mis proyectos"). */
export async function mine() {
  const me = await currentUser();
  return me ? QuoteModel.listByUser(me.id) : [];
}

/** Al abrir WhatsApp o el correo: una solicitud nueva pasa a "en proceso". */
export async function markContacted(fd: FormData) {
  await assertAccess("clientes", "edit");
  const { id } = parse(z.object({ id: quoteId }), fd);
  const q = await QuoteModel.findById(id);
  if (q?.status === "nueva") await QuoteModel.setStatus(id, "en_proceso");
}

/** Rechaza la solicitud con su motivo y, si la envió una cuenta, se lo avisa. */
export async function reject(fd: FormData) {
  await assertAccess("clientes", "edit");
  const v = parse(z.object({ id: quoteId, reason: z.string().trim().min(3, "Escribe el motivo del rechazo").max(500, "El motivo es muy largo") }), fd);
  const q = await QuoteModel.findById(v.id);
  if (!q) throw new UserError("Esa cotización ya no existe");
  if (q.projectId) throw new UserError("Ya se creó un proyecto con esta cotización");
  await QuoteModel.reject(v.id, v.reason);
  if (q.userId) await NotificationModel.create({ userId: q.userId, text: `Tu solicitud de cotización fue rechazada. Motivo: ${v.reason}`.slice(0, 300), href: "/mis-proyectos" });
}

export async function remove(fd: FormData) {
  await assertAccess("clientes", "edit");
  await QuoteModel.remove(parse(z.object({ id: z.coerce.number().int().positive() }), fd).id);
}

/** Acepta una cotización: reutiliza o crea el cliente, crea el proyecto ligado a la cuenta si la hay y reparte los honorarios en sus cobros. */
export async function convertToProject(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  await assertAccess("clientes", "view");
  await assertAccess("cobros", "edit");
  const v = parse(
    z.object({
      id: quoteId,
      name: z.string().trim().min(1, "El nombre es obligatorio").max(200),
      spaceType: z.string().trim().min(1, "El tipo de espacio es obligatorio").max(100),
      total: z.coerce.number({ error: "El monto debe ser un número" }).positive("El monto debe ser mayor que 0"),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha de entrega"),
    }),
    fd,
  );
  const q = await QuoteModel.findById(v.id);
  if (!q) throw new UserError("Esa cotización ya no existe");
  if (q.projectId) throw new UserError("Ya se creó un proyecto con esta cotización");
  if (q.status === "rechazada") throw new UserError("Esta cotización fue rechazada");

  const email = q.email?.toLowerCase() ?? null;
  const existing = email ? await ClientModel.findByEmail(email) : null;
  const clientId = existing?.id ?? (await ClientModel.create({ name: q.name, email, phone: q.phone }));
  const projectId = await ProjectModel.create({ name: v.name, spaceType: v.spaceType, clientId, clientUserId: q.userId, ownerId: u.id, stage: STAGES[0], dueDate: v.dueDate });
  await QuoteModel.setProject(q.id, projectId);
  await QuoteModel.setStatus(q.id, "aceptada");
  await PaymentController.addPlan(projectId, v.total);
  await ActivityController.record(projectId, "proyecto", `Proyecto creado a partir de la cotización del ${fmtDate(q.createdAt.toISOString().slice(0, 10))}`, {
    actorId: u.id,
    notifyClient: `Ya empezamos tu proyecto «${v.name}». Aquí podrás ver su avance y sus documentos.`,
  });
  return projectId;
}
