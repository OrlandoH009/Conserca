import { z } from "zod";
import { parse, UserError } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import * as VisitModel from "@/models/visit.model";
import * as ActivityController from "./activity.controller";

const pid = z.coerce.number().int().positive();
const text = (label: string) => z.string().trim().min(1, `${label} es obligatorio`).max(300);

/** Visitas de un proyecto, cada una con sus observaciones. */
export async function visitsOf(projectId: number) {
  await requireAccess("supervision");
  const visits = await VisitModel.listByProject(projectId);
  const obs = await VisitModel.observationsFor(visits.map((v) => v.id));
  return {
    visits: visits.map((v) => ({ ...v, observations: obs.filter((o) => o.visitId === v.id) })),
    openCount: obs.filter((o) => o.status === "abierta").length,
  };
}

export async function addVisit(fd: FormData) {
  const u = await assertAccess("supervision", "edit");
  const v = parse(z.object({ projectId: pid, visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige la fecha"), notes: text("El motivo") }), fd);
  await VisitModel.create(v);
  await ActivityController.record(v.projectId, "visita", `Visita programada para el ${fmtDate(v.visitDate)}: ${v.notes}`, { actorId: u.id, notifyClient: `Se programó una visita a tu proyecto para el ${fmtDate(v.visitDate)}.` });
  return v.projectId;
}

export async function markVisitDone(fd: FormData) {
  const u = await assertAccess("supervision", "edit");
  const v = parse(z.object({ id: pid, projectId: pid }), fd);
  const visit = await VisitModel.findById(v.id);
  if (!visit || visit.projectId !== v.projectId) throw new UserError("La visita no pertenece a este proyecto");
  await VisitModel.markDone(v.id);
  await ActivityController.record(v.projectId, "visita", `Visita realizada (${fmtDate(visit.visitDate)})`, { actorId: u.id, notifyClient: `Se realizó la visita del ${fmtDate(visit.visitDate)} a tu proyecto.` });
  return v.projectId;
}

export async function addObservation(fd: FormData) {
  await assertAccess("supervision", "edit");
  const v = parse(z.object({ projectId: pid, visitId: pid, text: text("La observación") }), fd);
  const visit = await VisitModel.findById(v.visitId);
  if (!visit || visit.projectId !== v.projectId) throw new UserError("La visita no pertenece a este proyecto");
  await VisitModel.createObservation({ visitId: v.visitId, text: v.text });
  return v.projectId;
}

export async function toggleObservation(fd: FormData) {
  await assertAccess("supervision", "edit");
  const v = parse(z.object({ id: pid, projectId: pid, to: z.enum(["abierta", "cerrada"]) }), fd);
  await VisitModel.setObservationStatus(v.id, v.to);
  return v.projectId;
}
