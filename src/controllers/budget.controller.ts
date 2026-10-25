import { z } from "zod";
import { parse } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import { budgetTotals } from "@/lib/calc";
import * as BudgetItemModel from "@/models/budget-item.model";

export async function budgetOf(projectId: number) {
  await requireAccess("presupuestos");
  const rows = await BudgetItemModel.listByProject(projectId);
  return { rows, totals: budgetTotals(rows) };
}

export async function addItem(fd: FormData) {
  await assertAccess("presupuestos", "edit");
  const v = parse(
    z.object({
      projectId: z.coerce.number().int().positive(),
      description: z.string().trim().min(1, "La partida es obligatoria").max(300),
      unit: z.string().trim().min(1, "La unidad es obligatoria").max(30),
      quantity: z.coerce.number({ error: "La cantidad debe ser un número" }).refine((n) => n > 0, "La cantidad debe ser mayor que 0"),
      unitPrice: z.coerce.number({ error: "El precio debe ser un número" }).refine((n) => n >= 0, "El precio no puede ser negativo"),
    }),
    fd,
  );
  await BudgetItemModel.create(v);
  return v.projectId;
}

export const removeItem = async (id: number) => { await assertAccess("presupuestos", "edit"); await BudgetItemModel.remove(id); };
