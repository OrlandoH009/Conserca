import type { NextRequest } from "next/server";
import * as BudgetController from "@/controllers/budget.controller";
import * as ProjectController from "@/controllers/project.controller";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { projectCode } from "@/lib/project";

/** Presupuesto del proyecto en CSV. Solo el equipo con acceso a presupuestos. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const n = Number(id);
  const u = await currentUser();
  const row = u && can(u.role, "presupuestos") && Number.isInteger(n) && n > 0 ? await ProjectController.getDetail(n) : null;
  if (!row) return new Response("No encontrado", { status: 404 });
  const csv = await BudgetController.csvOf(n);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="presupuesto-${projectCode(row.p.id, row.p.createdAt)}.csv"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
