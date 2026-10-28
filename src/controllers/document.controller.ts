import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { parse, UserError } from "@/lib/action-utils";
import { assertAccess, currentUser, requireAccess } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { fmtMB, isPdf, PDF_MAX } from "@/lib/pdf";
import { DOCS_DIR, removeStoredFile } from "@/lib/storage";
import * as ActivityController from "./activity.controller";
import * as DocumentModel from "@/models/document.model";

const pid = z.coerce.number().int().positive();
const STATUS_LABEL = { en_proceso: "En proceso", en_revision: "En revisión", entregado: "Entregado" } as const;

export async function documentsOf(projectId: number) {
  await requireAccess("proyectos");
  return DocumentModel.listByProject(projectId);
}

/** Guarda el PDF (opcional) y devuelve sus columnas; valida el contenido, no solo la extensión. */
async function saveFile(f: FormDataEntryValue | null) {
  if (!(f instanceof File) || f.size === 0) return {};
  if (f.size > PDF_MAX) throw new UserError(`Ese archivo pesa ${fmtMB(f.size)} y el máximo es ${fmtMB(PDF_MAX)}.`);
  const bytes = new Uint8Array(await f.arrayBuffer());
  if (!isPdf(bytes)) throw new UserError("Ese archivo no es un PDF válido. Guárdalo o expórtalo como PDF e inténtalo de nuevo.");
  const filePath = `${randomUUID()}.pdf`;
  try {
    await mkdir(DOCS_DIR, { recursive: true });
    await writeFile(path.join(DOCS_DIR, filePath), bytes);
  } catch {
    throw new UserError("No pudimos guardar el archivo. Intenta de nuevo; si sigue fallando, avisa a soporte.");
  }
  return { fileName: f.name.slice(0, 200), filePath, fileSize: bytes.length };
}

/** Registra un documento. Si ya hay uno con el mismo título en el proyecto, este es su siguiente versión. */
export async function create(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(
    z.object({ projectId: pid, title: z.string().trim().min(1, "El título es obligatorio").max(200), kind: z.enum(["memoria", "especificaciones", "presupuesto"]) }),
    fd,
  );
  const file = await saveFile(fd.get("file"));
  const version = (await DocumentModel.lastVersion(v.projectId, v.title)) + 1;
  await DocumentModel.create({ ...v, ...file, version });
  const hasFile = "filePath" in file;
  await ActivityController.record(v.projectId, "documento", `Documento «${v.title}», versión ${version}${hasFile ? "" : " (sin PDF todavía)"}`, {
    actorId: u.id,
    visibleToClient: hasFile, // el cliente solo ve documentos que ya tienen PDF
    notifyClient: hasFile ? `Hay un documento nuevo en tu proyecto: «${v.title}» (versión ${version}).` : undefined,
  });
  return v.projectId;
}

export async function setStatus(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id: pid, projectId: pid, status: z.enum(["en_proceso", "en_revision", "entregado"]) }), fd);
  const row = await DocumentModel.findWithOwner(v.id);
  if (!row || row.projectId !== v.projectId) throw new UserError("El documento no pertenece a este proyecto");
  if (v.status === "entregado" && !row.doc.filePath) throw new UserError("Sube el PDF antes de marcar el documento como entregado");
  if (row.doc.status === v.status) return v.projectId;
  await DocumentModel.setStatus(v.id, v.status);
  const hasFile = !!row.doc.filePath;
  await ActivityController.record(v.projectId, "documento", `Documento «${row.doc.title}»: ${STATUS_LABEL[v.status]}`, {
    actorId: u.id,
    visibleToClient: hasFile,
    notifyClient: hasFile ? `El documento «${row.doc.title}» de tu proyecto pasó a «${STATUS_LABEL[v.status]}».` : undefined,
  });
  return v.projectId;
}

/** Elimina un documento y su PDF del disco. */
export async function remove(fd: FormData) {
  const u = await assertAccess("proyectos", "edit");
  const v = parse(z.object({ id: pid, projectId: pid }), fd);
  const row = await DocumentModel.findWithOwner(v.id);
  if (!row || row.projectId !== v.projectId) throw new UserError("El documento no pertenece a este proyecto");
  await DocumentModel.remove(v.id);
  if (row.doc.filePath) await removeStoredFile(row.doc.filePath);
  await ActivityController.record(v.projectId, "documento", `Documento «${row.doc.title}» (versión ${row.doc.version}) eliminado`, { actorId: u.id, visibleToClient: false });
  return v.projectId;
}

/** El cliente aprueba un documento o pide cambios (con comentario). Solo el dueño del proyecto y solo si ya hay PDF. */
export async function review(fd: FormData) {
  const me = await currentUser();
  if (!me) throw new UserError("Inicia sesión de nuevo");
  const v = parse(z.object({ id: pid, decision: z.enum(["aprobado", "cambios"]), comment: z.string().trim().max(500, "El comentario es muy largo").optional() }), fd);
  const row = await DocumentModel.findWithOwner(v.id);
  if (!row || row.clientUserId !== me.id || !row.doc.filePath) throw new UserError("No encontramos ese documento");
  if (v.decision === "cambios" && (v.comment ?? "").length < 3) throw new UserError("Cuéntanos qué hay que cambiar");
  await DocumentModel.setReview(v.id, v.decision, v.comment || null);
  const verb = v.decision === "aprobado" ? "aprobó" : "pidió cambios en";
  await ActivityController.record(row.projectId, "revision", `${me.name} ${verb} «${row.doc.title}»${v.comment ? `: ${v.comment}` : ""}`, { actorId: me.id });
  await ActivityController.notifyStaff("proyectos", `${me.name} ${verb} «${row.doc.title}» (${row.projectName})`, `/app/proyectos/${row.projectId}?tab=documentos`, {
    need: "edit",
    exceptUserId: me.id,
    alsoUserIds: [row.ownerId],
  });
}

/** PDF de un documento si la sesión puede verlo: el equipo con acceso a proyectos o el cliente dueño del proyecto. */
export async function fileFor(id: number) {
  const u = await currentUser();
  const row = u ? await DocumentModel.findWithOwner(id) : null;
  if (!u || !row?.doc.filePath) return null;
  if (!can(u.role, "proyectos") && row.clientUserId !== u.id) return null;
  return { name: row.doc.fileName ?? "documento.pdf", path: path.join(DOCS_DIR, path.basename(row.doc.filePath)) };
}
