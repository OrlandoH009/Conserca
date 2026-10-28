import { z } from "zod";
import { parse, UserError } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import * as ClientModel from "@/models/client.model";

const idSchema = z.coerce.number().int().positive();
const shape = {
  name: z.string().trim().min(2, "El nombre es obligatorio").max(150),
  contact: z.string().trim().max(150).optional(),
  email: z.union([z.literal(""), z.email("Escribe un correo válido")]).optional(),
  phone: z.string().trim().max(40).optional(),
};
const values = (v: { name: string; contact?: string; email?: string; phone?: string }) => ({ name: v.name, contact: v.contact || null, email: v.email || null, phone: v.phone || null });

/** Lista de clientes (registros del equipo) para la pantalla "Clientes y cotizaciones". */
export async function list() {
  await requireAccess("clientes");
  return ClientModel.list();
}

export async function add(fd: FormData) {
  await assertAccess("clientes", "edit");
  await ClientModel.create(values(parse(z.object(shape), fd)));
}

export async function update(fd: FormData) {
  await assertAccess("clientes", "edit");
  const v = parse(z.object({ id: idSchema, ...shape }), fd);
  await ClientModel.update(v.id, values(v));
}

/** Un cliente con proyectos no se borra: primero hay que cambiarlos de cliente o archivarlos. */
export async function remove(fd: FormData) {
  await assertAccess("clientes", "edit");
  const { id } = parse(z.object({ id: idSchema }), fd);
  const n = await ClientModel.countProjects(id);
  if (n > 0) throw new UserError(`Este cliente tiene ${n} ${n === 1 ? "proyecto" : "proyectos"}. Cámbialos de cliente antes de eliminarlo.`);
  await ClientModel.remove(id);
}
