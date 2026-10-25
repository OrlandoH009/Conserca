import { z } from "zod";
import { parse } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import * as DocumentModel from "@/models/document.model";

const pid = z.coerce.number().int().positive();

export async function documentsOf(projectId: number) {
  await requireAccess("proyectos");
  return DocumentModel.listByProject(projectId);
}

export async function create(fd: FormData) {
  await assertAccess("proyectos", "edit");
  const v = parse(
    z.object({ projectId: pid, title: z.string().trim().min(1, "El título es obligatorio").max(200), kind: z.enum(["memoria", "especificaciones", "presupuesto"]) }),
    fd,
  );
  await DocumentModel.create({ ...v, version: (await DocumentModel.lastVersion(v.projectId)) + 1 });
  return v.projectId;
}

export async function setStatus(fd: FormData) {
  await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id: pid, projectId: pid, status: z.enum(["en_proceso", "en_revision", "entregado"]) }), fd);
  await DocumentModel.setStatus(v.id, v.status);
  return v.projectId;
}
