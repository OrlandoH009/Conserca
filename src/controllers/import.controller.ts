import { readSheet } from "read-excel-file/node";
import { UserError } from "@/lib/action-utils";
import { assertAccess } from "@/lib/auth";
import { MAX_ROWS, parseRows, type ImportResult, type ImportRow } from "@/lib/project-import";
import * as ClientModel from "@/models/client.model";
import * as ProjectModel from "@/models/project.model";
import * as UserModel from "@/models/user.model";

const MAX_BYTES = 5 * 1024 * 1024;
const NOT_TEMPLATE = "Ese archivo no es la plantilla de proyectos previos. Descárgala y úsala sin cambiar sus columnas.";

/** Reutiliza el cliente por correo o por nombre; si no existe, lo crea. */
async function clientIdFor(r: ImportRow) {
  const found = (r.email ? await ClientModel.findByEmail(r.email) : null) ?? (await ClientModel.findByName(r.client));
  return found?.id ?? ClientModel.create({ name: r.client, contact: r.contact, email: r.email, phone: r.phone, taxId: r.taxId, billingEmail: r.billingEmail, authorizer: r.authorizer });
}

/**
 * Revisa el Excel y, con `commit=1` y sin errores, crea los proyectos. Lo que ya existe (mismo nombre) se omite,
 * así que volver a subir el archivo tras un fallo no duplica nada.
 * Las cuentas de cliente no se ligan por correo: el registro no verifica correos y otra persona podría ver el proyecto.
 */
export async function importFile(fd: FormData): Promise<ImportResult> {
  const u = await assertAccess("cobros", "edit");
  await assertAccess("proyectos", "edit");
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_BYTES || !file.name.toLowerCase().endsWith(".xlsx")) throw new UserError("Sube un archivo Excel (.xlsx) de hasta 5 MB");

  const rows = await readSheet(Buffer.from(await file.arrayBuffer()), "Proyectos").catch(() => { throw new UserError(NOT_TEMPLATE); });
  const { headersOk, items, errors } = parseRows(rows);
  if (!headersOk) throw new UserError(NOT_TEMPLATE);
  if (items.length + errors.length === 0) throw new UserError("El archivo no tiene proyectos");
  if (rows.length - 1 > MAX_ROWS) throw new UserError("El archivo tiene más de 500 proyectos. Divídelo en varios.");

  // Responsable: debe ser una cuenta del equipo; vacío = quien carga el archivo.
  const owners = new Map<string, number>();
  for (const mail of new Set(items.flatMap((r) => (r.ownerEmail ? [r.ownerEmail] : [])))) {
    const w = await UserModel.findByEmail(mail);
    if (w && w.role !== "usuario") owners.set(mail, w.id);
  }
  for (const r of items) if (r.ownerEmail && !owners.has(r.ownerEmail)) errors.push({ row: r.row, msg: "«{col}» no corresponde a un trabajador del sistema", col: "Responsable (correo del trabajador)" });
  errors.sort((a, b) => a.row - b.row);

  const taken = new Set((await ProjectModel.allNames()).map((n) => n.toLowerCase()));
  const fresh = items.filter((r) => !taken.has(r.name.toLowerCase()));
  const skipped = items.filter((r) => taken.has(r.name.toLowerCase())).map((r) => r.name);
  if (errors.length > 0 || fd.get("commit") !== "1") return { errors, fresh: fresh.map((r) => ({ name: r.name, client: r.client })), skipped };

  for (const r of fresh) {
    await ProjectModel.createImported(
      { name: r.name, clientId: await clientIdFor(r), ownerId: (r.ownerEmail && owners.get(r.ownerEmail)) || u.id, spaceType: r.spaceType, stage: r.stage, status: r.status, progress: r.progress, dueDate: r.dueDate, ...(r.startDate ? { createdAt: new Date(`${r.startDate}T12:00:00Z`) } : {}) },
      r.payments,
      r.budget,
      [
        { type: "proyecto", message: "Proyecto cargado desde Excel", visibleToClient: false, createdBy: u.id },
        ...(r.notes ? [{ type: "proyecto", message: `Nota: ${r.notes}`, visibleToClient: false, createdBy: u.id }] : []),
      ],
    );
  }
  return { created: fresh.length, skipped };
}
