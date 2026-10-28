import { z } from "zod";
import { parse } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import { budgetTotals } from "@/lib/calc";
import * as BudgetItemModel from "@/models/budget-item.model";

const itemShape = {
  description: z.string().trim().min(1, "La partida es obligatoria").max(300),
  unit: z.string().trim().min(1, "La unidad es obligatoria").max(30),
  quantity: z.coerce.number({ error: "La cantidad debe ser un número" }).refine((n) => n > 0, "La cantidad debe ser mayor que 0"),
  unitPrice: z.coerce.number({ error: "El precio debe ser un número" }).refine((n) => n >= 0, "El precio no puede ser negativo"),
};
const pid = z.coerce.number().int().positive();

export async function budgetOf(projectId: number) {
  await requireAccess("presupuestos");
  const rows = await BudgetItemModel.listByProject(projectId);
  return { rows, totals: budgetTotals(rows) };
}

export async function addItem(fd: FormData) {
  await assertAccess("presupuestos", "edit");
  const v = parse(z.object({ projectId: pid, ...itemShape }), fd);
  await BudgetItemModel.create(v);
  return v.projectId;
}

export async function updateItem(fd: FormData) {
  await assertAccess("presupuestos", "edit");
  const { id, projectId, ...fields } = parse(z.object({ id: pid, projectId: pid, ...itemShape }), fd);
  await BudgetItemModel.update(id, projectId, fields);
  return projectId;
}

export const removeItem = async (id: number, projectId: number) => { await assertAccess("presupuestos", "edit"); await BudgetItemModel.remove(id, projectId); };

/** Partidas del presupuesto como CSV (UTF-8 con BOM para que Excel respete los acentos). */
export async function csvOf(projectId: number) {
  const { rows, totals } = await budgetOf(projectId);
  const q = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [
    ["Partida", "Unidad", "Cantidad", "Precio unitario", "Importe"].map(q).join(","),
    ...rows.map((r) => [q(r.description), q(r.unit), r.quantity, r.unitPrice, (r.quantity * r.unitPrice).toFixed(2)].join(",")),
    ["", "", "", q("Subtotal"), totals.subtotal.toFixed(2)].join(","),
    ["", "", "", q("IVA"), totals.iva.toFixed(2)].join(","),
    ["", "", "", q("Total"), totals.total.toFixed(2)].join(","),
  ];
  return "﻿" + lines.join("\r\n") + "\r\n";
}
