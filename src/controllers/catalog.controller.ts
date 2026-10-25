import { z } from "zod";
import { parse } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import * as EquipmentModel from "@/models/equipment.model";

export async function list(q?: string) {
  await requireAccess("catalogo");
  const term = q?.trim().toLowerCase() ?? "";
  const rows = await EquipmentModel.list();
  return rows.filter((r) => !term || `${r.name} ${r.category} ${r.brand}`.toLowerCase().includes(term));
}

export async function add(fd: FormData) {
  await assertAccess("catalogo", "edit");
  const text = (l: string) => z.string().trim().min(1, `${l} es obligatorio`).max(200);
  const v = parse(z.object({ name: text("El nombre"), category: text("La categoría"), capacity: text("La capacidad o medida"), brand: z.string().trim().max(100).optional() }), fd);
  await EquipmentModel.create({ ...v, brand: v.brand || "Genérico" });
}

export async function remove(fd: FormData) {
  await assertAccess("catalogo", "edit");
  await EquipmentModel.remove(parse(z.object({ id: z.coerce.number().int().positive() }), fd).id);
}
