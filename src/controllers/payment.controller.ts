import { z } from "zod";
import { parse, UserError } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import { isDue, splitPlan } from "@/lib/payments";
import * as ActivityController from "./activity.controller";
import * as ClientModel from "@/models/client.model";
import * as PaymentModel from "@/models/payment.model";
import * as ProjectModel from "@/models/project.model";

const id = z.coerce.number().int().positive();
const STATUS = z.enum(["pendiente", "facturado", "cobrado"]);
const STATUS_LABEL = { pendiente: "Pendiente", facturado: "Facturado", cobrado: "Cobrado" } as const;
const fields = {
  label: z.string().trim().min(1, "El concepto es obligatorio").max(80),
  amount: z.coerce.number({ error: "El monto debe ser un número" }).refine((n) => n > 0, "El monto debe ser mayor que 0"),
  dueProgress: z.coerce.number().int("Escribe un número entero").min(0, "Entre 0 y 100").max(100, "Entre 0 y 100"),
};
const invoiceNo = z.string().trim().max(60).optional();

/** Fechas que acompañan a cada estado: al facturar o cobrar se anota el día; al volver atrás se borran. */
function datesFor(status: z.infer<typeof STATUS>, old: { invoicedAt: string | null; paidAt: string | null }) {
  const today = todayISO();
  if (status === "pendiente") return { invoicedAt: null, paidAt: null };
  if (status === "facturado") return { invoicedAt: old.invoicedAt ?? today, paidAt: null };
  return { invoicedAt: old.invoicedAt ?? today, paidAt: old.paidAt ?? today };
}

/** Cobros de un proyecto, el proyecto y los datos de facturación de su cliente. */
export async function planOf(projectId: number) {
  await requireAccess("cobros");
  const [rows, row] = await Promise.all([PaymentModel.listByProject(projectId), ProjectModel.findWithClient(projectId)]);
  const client = row?.p.clientId ? await ClientModel.findById(row.p.clientId) : null;
  return { rows, project: row?.p ?? null, client };
}

/** Reparte los honorarios del diseño en los cobros estándar de un proyecto nuevo. */
export async function addPlan(projectId: number, total: number) {
  const u = await assertAccess("cobros", "edit");
  await PaymentModel.createMany(splitPlan(total).map((p) => ({ ...p, projectId })));
  await ActivityController.record(projectId, "cobro", "Plan de cobros creado", { actorId: u.id, visibleToClient: false });
}

/** Crea los cobros estándar a partir de los honorarios. Solo si el proyecto aún no tiene plan. */
export async function createPlan(fd: FormData) {
  await assertAccess("cobros", "edit");
  const v = parse(z.object({ projectId: id, total: fields.amount }), fd);
  if (!(await ProjectModel.findById(v.projectId))) throw new UserError("Ese proyecto ya no existe");
  if ((await PaymentModel.listByProject(v.projectId)).length > 0) throw new UserError("Este proyecto ya tiene un plan de cobros");
  await addPlan(v.projectId, v.total);
  return v.projectId;
}

/** Edición completa de un cobro (concepto, monto, avance, estado y factura). */
export async function update(fd: FormData) {
  const u = await assertAccess("cobros", "edit");
  const v = parse(z.object({ id, projectId: id, ...fields, status: STATUS, invoiceNo }), fd);
  const old = await PaymentModel.find(v.id, v.projectId);
  if (!old) throw new UserError("Ese cobro ya no existe");
  await PaymentModel.update(v.id, v.projectId, { label: v.label, amount: v.amount, dueProgress: v.dueProgress, status: v.status, invoiceNo: v.invoiceNo || null, ...datesFor(v.status, old) });
  if (old.status !== v.status) await ActivityController.record(v.projectId, "cobro", `Cobro «${v.label}»: ${STATUS_LABEL[v.status]}`, { actorId: u.id, visibleToClient: false });
  return v.projectId;
}

/** Atajo para pasar un cobro a «facturado» (con su número de factura) o «cobrado». */
export async function setStatus(fd: FormData) {
  const u = await assertAccess("cobros", "edit");
  const v = parse(z.object({ id, projectId: id, status: STATUS, invoiceNo }), fd);
  const old = await PaymentModel.find(v.id, v.projectId);
  if (!old) throw new UserError("Ese cobro ya no existe");
  await PaymentModel.update(v.id, v.projectId, { status: v.status, ...(v.invoiceNo ? { invoiceNo: v.invoiceNo } : {}), ...datesFor(v.status, old) });
  if (old.status !== v.status) await ActivityController.record(v.projectId, "cobro", `Cobro «${old.label}»: ${STATUS_LABEL[v.status]}`, { actorId: u.id, visibleToClient: false });
  return v.projectId;
}

export const remove = async (id: number, projectId: number) => { await assertAccess("cobros", "edit"); await PaymentModel.remove(id, projectId); };

/** Para el panel general: qué hay que facturar ya, qué está facturado sin cobrar y cuántos pendientes aún no llegan a su avance. */
export async function attention() {
  await requireAccess("cobros");
  const rows = await PaymentModel.open();
  const toInvoice = rows.filter((r) => isDue(r.pay, { progress: r.progress, status: r.projectStatus }));
  const toCollect = rows.filter((r) => r.pay.status === "facturado");
  const later = rows.length - toInvoice.length - toCollect.length;
  return { toInvoice, toCollect, later };
}
