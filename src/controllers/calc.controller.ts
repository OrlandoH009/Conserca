import { z } from "zod";
import { parse } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import { coolingLoad, round, ventFlow } from "@/lib/calc";
import * as AirElementModel from "@/models/air-element.model";
import * as SpaceModel from "@/models/space.model";
import * as VentZoneModel from "@/models/vent-zone.model";

const num = (label: string) => z.coerce.number({ error: `${label} debe ser un número` });
const text = (label: string) => z.string().trim().min(1, `${label} es obligatorio`).max(300);
const pid = z.coerce.number().int().positive();

// ---- Cargas térmicas
export async function spacesOf(projectId: number) {
  await requireAccess("calculos");
  const rows = await SpaceModel.listByProject(projectId);
  return { rows, kw: round(rows.reduce((s, r) => s + r.loadKw, 0)), tr: round(rows.reduce((s, r) => s + r.loadTr, 0)) };
}

export async function addSpace(fd: FormData) {
  await assertAccess("calculos", "edit");
  const v = parse(
    z.object({
      projectId: pid, name: text("El nombre"), usage: text("El uso"),
      orientation: z.enum(["norte", "sur", "este", "oeste"], { error: "Elige la orientación" }),
      areaM2: num("El área"), heightM: num("La altura"), people: num("Las personas"), equipmentW: num("Los equipos"), lightingWm2: num("La iluminación"),
    }),
    fd,
  );
  const r = coolingLoad(v); // lanza RangeError con un mensaje claro si los datos no sirven
  await SpaceModel.create({ ...v, loadKw: r.kw, loadTr: r.tr });
  return v.projectId;
}

export const removeSpace = async (id: number) => { await assertAccess("calculos", "edit"); await SpaceModel.remove(id); };

// ---- Distribución de aire
export async function airElementsOf(projectId: number) {
  await requireAccess("calculos");
  return AirElementModel.listByProject(projectId);
}

export async function addAirElement(fd: FormData) {
  await assertAccess("calculos", "edit");
  const v = parse(
    z.object({ projectId: pid, name: text("El nombre"), kind: text("El tipo"), flowM3h: num("El caudal").refine((n) => n > 0, "El caudal debe ser mayor que 0"), size: text("La medida") }),
    fd,
  );
  await AirElementModel.create(v);
  return v.projectId;
}

export const removeAirElement = async (id: number) => { await assertAccess("calculos", "edit"); await AirElementModel.remove(id); };

// ---- Ventilación mecánica
export async function ventZonesOf(projectId: number) {
  await requireAccess("calculos");
  return VentZoneModel.listByProject(projectId);
}

export async function addVentZone(fd: FormData) {
  await assertAccess("calculos", "edit");
  const v = parse(
    z.object({
      projectId: pid, name: text("El nombre"),
      kind: z.enum(["estacionamiento", "sanitarios", "escalera", "bodega"], { error: "Elige el tipo de espacio" }),
      areaM2: z.string().optional(), heightM: z.string().optional(), ach: z.string().optional(), doors: z.string().optional(),
    }),
    fd,
  );
  const n = (s?: string) => (s === undefined || s === "" ? undefined : Number(s));
  const input = { kind: v.kind, areaM2: n(v.areaM2), heightM: n(v.heightM), ach: n(v.ach), doors: n(v.doors) };
  const flowM3h = ventFlow(input);
  await VentZoneModel.create({ projectId: v.projectId, kind: v.kind, name: v.name, areaM2: input.areaM2 ?? null, heightM: input.heightM ?? null, ach: input.ach ?? null, doors: input.doors ?? null, flowM3h });
  return v.projectId;
}

export const removeVentZone = async (id: number) => { await assertAccess("calculos", "edit"); await VentZoneModel.remove(id); };
