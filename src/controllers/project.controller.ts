import { z } from "zod";
import { parse, UserError } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import * as BudgetController from "./budget.controller";
import * as CalcController from "./calc.controller";
import * as AirElementModel from "@/models/air-element.model";
import * as ClientModel from "@/models/client.model";
import * as ProjectModel from "@/models/project.model";
import * as SpaceModel from "@/models/space.model";
import * as VentZoneModel from "@/models/vent-zone.model";

const text = (label: string) => z.string().trim().min(1, `${label} es obligatorio`).max(300);
const id = z.coerce.number().int().positive();
const STATUSES = ["en_proceso", "en_revision", "entregado", "atrasado"] as const;

export async function list(filters: { estado?: string; q?: string }) {
  await requireAccess("proyectos");
  const q = filters.q?.trim().toLowerCase() ?? "";
  const estado = STATUSES.find((s) => s === filters.estado);
  const rows = await ProjectModel.list();
  return rows.filter((r) => (!estado || r.p.status === estado) && (!q || `${r.p.name} ${r.client ?? ""}`.toLowerCase().includes(q)));
}

export async function clientOptions() {
  await requireAccess("proyectos");
  return ClientModel.options();
}

export async function create(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(
    z.object({
      name: text("El nombre"),
      spaceType: text("El tipo de espacio"),
      clientId: z.string().optional(),
      dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una fecha de entrega").or(z.literal("")),
    }),
    fd,
  );
  const clientId = v.clientId ? Number(v.clientId) : null;
  if (clientId !== null && !Number.isInteger(clientId)) throw new UserError("Cliente no válido");
  await ProjectModel.create({ name: v.name, spaceType: v.spaceType, clientId, dueDate: v.dueDate || null, ownerId: u.id });
}

export async function setStatus(fd: FormData) {
  await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id, status: z.enum(STATUSES) }), fd);
  await ProjectModel.setStatus(v.id, v.status);
  return v.id;
}

export async function setStage(fd: FormData) {
  await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id, stage: text("La etapa") }), fd);
  await ProjectModel.setStage(v.id, v.stage);
  return v.id;
}

export async function getDetail(projectId: number) {
  await requireAccess("proyectos");
  return ProjectModel.findWithClient(projectId);
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
  const remove = {
    spaces: CalcController.removeSpace,
    airElements: CalcController.removeAirElement,
    ventZones: CalcController.removeVentZone,
    budgetItems: BudgetController.removeItem,
  }[v.table];
  await remove(v.id);
  return v.projectId;
}
