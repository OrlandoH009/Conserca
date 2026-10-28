import { z } from "zod";
import { parse, UserError } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import { daysLate, STATUS_LABEL } from "@/lib/project";
import { STAGES } from "@/lib/stages";
import { removeStoredFile } from "@/lib/storage";
import * as ActivityController from "./activity.controller";
import * as BudgetController from "./budget.controller";
import * as CalcController from "./calc.controller";
import * as AirElementModel from "@/models/air-element.model";
import * as ClientModel from "@/models/client.model";
import * as DocumentModel from "@/models/document.model";
import * as EventModel from "@/models/event.model";
import * as ProjectModel from "@/models/project.model";
import * as SpaceModel from "@/models/space.model";
import * as UserModel from "@/models/user.model";
import * as VentZoneModel from "@/models/vent-zone.model";

const text = (label: string) => z.string().trim().min(1, `${label} es obligatorio`).max(300);
const id = z.coerce.number().int().positive();
const STATUSES = ["en_proceso", "en_revision", "entregado", "atrasado"] as const;
const dueDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha de entrega").or(z.literal(""));
const STAFF_ROLES = ["admin", "ingenieria", "presupuestos", "supervision"] as const;

export async function list(filters: { estado?: string; q?: string; archivados?: boolean }) {
  await requireAccess("proyectos");
  const q = filters.q?.trim().toLowerCase() ?? "";
  const estado = STATUSES.find((s) => s === filters.estado);
  const rows = await ProjectModel.list(!!filters.archivados);
  return rows
    .filter((r) => (!estado || r.p.status === estado) && (!q || `${r.p.name} ${r.client ?? ""} ${r.account ?? ""}`.toLowerCase().includes(q)))
    .map((r) => ({ ...r, late: daysLate(r.p.dueDate, r.p.status) }));
}

export async function archivedCount() {
  await requireAccess("proyectos");
  return ProjectModel.countArchived();
}

export async function clientOptions() {
  await requireAccess("proyectos");
  return ClientModel.options();
}

/** Responsables posibles de un proyecto: el equipo (no las cuentas de cliente). */
export async function staffOptions() {
  await requireAccess("proyectos");
  return UserModel.listByRoles([...STAFF_ROLES]);
}

/** Proyectos vigentes (id y nombre) para elegir uno, p. ej. al guardar un cálculo. */
export async function projectOptions() {
  await requireAccess("calculos");
  return ProjectModel.options();
}

const toId = (s: string | undefined, label: string) => {
  if (!s) return null;
  const n = Number(s);
  if (!Number.isInteger(n) || n <= 0) throw new UserError(`${label} no válido`);
  return n;
};

export async function create(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(z.object({ name: text("El nombre"), spaceType: text("El tipo de espacio"), clientId: z.string().optional(), dueDate }), fd);
  const projectId = await ProjectModel.create({ name: v.name, spaceType: v.spaceType, clientId: toId(v.clientId, "Cliente"), dueDate: v.dueDate || null, ownerId: u.id, stage: STAGES[0] });
  await ActivityController.record(projectId, "proyecto", "Proyecto creado", { actorId: u.id, visibleToClient: false });
}

/** Cambia los datos básicos del proyecto (nombre, tipo, cliente, responsable y fecha de entrega). */
export async function update(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id, name: text("El nombre"), spaceType: text("El tipo de espacio"), clientId: z.string().optional(), ownerId: z.string().optional(), dueDate }), fd);
  const clientId = toId(v.clientId, "Cliente");
  const ownerId = toId(v.ownerId, "Responsable");
  if (clientId !== null && !(await ClientModel.findById(clientId))) throw new UserError("Ese cliente ya no existe");
  if (ownerId !== null) {
    const owner = await UserModel.findPublicById(ownerId);
    if (!owner || owner.role === "usuario") throw new UserError("El responsable debe ser del equipo");
  }
  await ProjectModel.update(v.id, { name: v.name, spaceType: v.spaceType, clientId, ownerId, dueDate: v.dueDate || null });
  await ActivityController.record(v.id, "proyecto", "Datos del proyecto actualizados", { actorId: u.id, visibleToClient: false });
  return v.id;
}

async function mustExist(projectId: number) {
  const p = await ProjectModel.findById(projectId);
  if (!p) throw new UserError("Ese proyecto ya no existe");
  return p;
}

export async function setStatus(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id, status: z.enum(STATUSES) }), fd);
  const p = await mustExist(v.id);
  if (p.status === v.status) return v.id;
  await ProjectModel.setStatus(v.id, v.status);
  await ActivityController.record(v.id, "estado", `Estado: ${STATUS_LABEL[v.status]}`, { actorId: u.id, notifyClient: `Tu proyecto «${p.name}» ahora está «${STATUS_LABEL[v.status]}».` });
  return v.id;
}

export async function setStage(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id, stage: z.enum(STAGES, { error: "Elige una etapa de la lista" }) }), fd);
  const p = await mustExist(v.id);
  if (p.stage === v.stage) return v.id;
  await ProjectModel.setStage(v.id, v.stage);
  await ActivityController.record(v.id, "etapa", `Etapa: ${v.stage}`, { actorId: u.id, notifyClient: `Tu proyecto «${p.name}» pasó a la etapa «${v.stage}».` });
  return v.id;
}

export async function setProgress(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id, progress: z.coerce.number().int("Escribe un número entero").min(0, "Entre 0 y 100").max(100, "Entre 0 y 100") }), fd);
  const p = await mustExist(v.id);
  if (p.progress === v.progress) return v.id;
  await ProjectModel.setProgress(v.id, v.progress);
  await ActivityController.record(v.id, "avance", `Avance: ${p.progress} % → ${v.progress} %`, { actorId: u.id, notifyClient: `El avance de tu proyecto «${p.name}» es ahora de ${v.progress} %.` });
  return v.id;
}

/** Cuentas de cliente a las que se puede ligar un proyecto. */
export async function clientUserOptions() {
  await requireAccess("proyectos");
  return (await UserModel.listPublic()).filter((x) => x.role === "usuario");
}

/** Liga (o suelta) la cuenta de cliente. Si el proyecto aún no tiene cliente, se crea o reutiliza su registro con los datos de la cuenta. */
export async function setClientUser(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id, userId: z.string() }), fd);
  const userId = toId(v.userId, "Cuenta");
  const p = await mustExist(v.id);
  const account = userId !== null ? await UserModel.findPublicById(userId) : null;
  if (userId !== null && account?.role !== "usuario") throw new UserError("Cuenta de cliente no válida");
  await ProjectModel.setClientUser(v.id, userId);
  if (account && p.clientId === null) {
    const existing = await ClientModel.findByEmail(account.email);
    const clientId = existing?.id ?? (await ClientModel.create({ name: account.name, email: account.email, phone: account.phone }));
    await ProjectModel.update(v.id, { clientId });
  }
  await ActivityController.record(v.id, "cliente", account ? `Cuenta del cliente ligada: ${account.name}` : "Cuenta del cliente desligada", { actorId: u.id, visibleToClient: false });
  return v.id;
}

export async function archive(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id, on: z.enum(["1", "0"]) }), fd);
  await mustExist(v.id);
  await ProjectModel.archive(v.id, v.on === "1");
  await ActivityController.record(v.id, "proyecto", v.on === "1" ? "Proyecto archivado" : "Proyecto restaurado", { actorId: u.id, visibleToClient: false });
  return v.id;
}

/** Borra el proyecto con todo lo suyo (cálculos, documentos y sus PDF). Solo administración y solo si está archivado. */
export async function remove(fd: FormData) {
  await assertAccess("usuarios", "edit");
  const { id: projectId } = parse(z.object({ id }), fd);
  const p = await mustExist(projectId);
  if (!p.archivedAt) throw new UserError("Archiva el proyecto antes de eliminarlo");
  const files = await DocumentModel.filesOfProject(projectId);
  await ProjectModel.remove(projectId); // las tablas hijas se borran en cascada
  await Promise.all(files.map(removeStoredFile));
}

export async function getDetail(projectId: number) {
  await requireAccess("proyectos");
  return ProjectModel.findWithClient(projectId);
}

/** Movimientos del proyecto (más recientes primero) para la pestaña de actividad. */
export async function activityOf(projectId: number) {
  await requireAccess("proyectos");
  return EventModel.listByProject(projectId);
}

/** Todo lo que lleva la memoria de cálculo imprimible. */
export async function getMemoria(projectId: number) {
  await requireAccess("proyectos");
  const row = await ProjectModel.findWithClient(projectId);
  if (!row) return null;
  const [spaces, air, zones] = await Promise.all([
    SpaceModel.listByProject(projectId),
    AirElementModel.listByProject(projectId),
    VentZoneModel.listByProject(projectId),
  ]);
  return { ...row, spaces, air, zones };
}

/** Quita una fila de las tablas editables del proyecto; devuelve el proyecto para refrescar su pantalla. */
export async function removeRow(fd: FormData) {
  const v = parse(z.object({ table: z.enum(["spaces", "airElements", "ventZones", "budgetItems"]), id, projectId: id }), fd);
  const del = {
    spaces: CalcController.removeSpace,
    airElements: CalcController.removeAirElement,
    ventZones: CalcController.removeVentZone,
    budgetItems: BudgetController.removeItem,
  }[v.table];
  await del(v.id, v.projectId);
  return v.projectId;
}
