import bcrypt from "bcryptjs";
import { z } from "zod";
import { parse, UserError } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import { ROLES } from "@/lib/permissions";
import * as ProjectModel from "@/models/project.model";
import * as UserModel from "@/models/user.model";

const PHONE = /^[+d][ds().-]{6,}$/;
const role = z.enum(ROLES as [string, ...string[]], { error: "Elige un rol" });

export async function list() {
  const me = await requireAccess("usuarios");
  return { me, users: await UserModel.listPublic() };
}

export async function create(fd: FormData) {
  await assertAccess("usuarios", "edit");
  const v = parse(
    z.object({
      name: z.string().trim().min(2, "El nombre es obligatorio").max(120),
      email: z.email("Escribe un correo válido").transform((s) => s.toLowerCase().trim()),
      role,
      password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres").max(100),
    }),
    fd,
  );
  if (await UserModel.findByEmail(v.email)) throw new UserError("Ya existe un usuario con ese correo");
  await UserModel.create({ name: v.name, email: v.email, role: v.role as UserModel.Role, passwordHash: await bcrypt.hash(v.password, 10) });
}

export async function setRole(fd: FormData) {
  const me = await assertAccess("usuarios", "edit");
  const v = parse(z.object({ id: z.coerce.number().int().positive(), role }), fd);
  // Para no quedarse sin administración, nadie puede quitarse a sí mismo el rol de admin.
  if (v.id === me.id && v.role !== "admin") return;
  await UserModel.setRole(v.id, v.role as UserModel.Role);
}

export async function get(id: number) {
  await requireAccess("usuarios");
  return UserModel.findPublicById(id);
}

/** Edita los datos de un usuario. Contraseña vacía = no cambia. Nadie se cambia su propio rol, y siempre debe quedar un administrador. */
export async function update(fd: FormData) {
  const me = await assertAccess("usuarios", "edit");
  const v = parse(
    z.object({
      id: z.coerce.number().int().positive(),
      name: z.string().trim().min(2, "El nombre es obligatorio").max(120),
      email: z.email("Escribe un correo válido").transform((s) => s.toLowerCase().trim()),
      phone: z.string().trim().max(40).refine((p) => p === "" || PHONE.test(p), "Escribe un teléfono o WhatsApp válido"),
      role,
      password: z.string().max(100).refine((p) => p === "" || p.length >= 10, "La contraseña nueva debe tener al menos 10 caracteres"),
    }),
    fd,
  );
  const target = await UserModel.findPublicById(v.id);
  if (!target) throw new UserError("Ese usuario ya no existe");
  const other = await UserModel.findByEmail(v.email);
  if (other && other.id !== v.id) throw new UserError("Ya existe un usuario con ese correo");
  const newRole = (v.id === me.id ? target.role : v.role) as UserModel.Role;
  if (target.role === "admin" && newRole !== "admin" && (await UserModel.countByRole("admin")) <= 1) throw new UserError("Debe quedar al menos un administrador");
  await UserModel.update(v.id, { name: v.name, email: v.email, phone: v.phone || null, role: newRole });
  if (v.password) await UserModel.setPassword(v.id, await bcrypt.hash(v.password, 10));
}

/** Elimina un usuario. Sus proyectos se conservan (solo pierden el vínculo). No se puede borrar a uno mismo ni al último administrador. */
export async function remove(fd: FormData) {
  const me = await assertAccess("usuarios", "edit");
  const v = parse(z.object({ id: z.coerce.number().int().positive() }), fd);
  if (v.id === me.id) throw new UserError("No puedes eliminar tu propia cuenta");
  const target = await UserModel.findPublicById(v.id);
  if (!target) return;
  if (target.role === "admin" && (await UserModel.countByRole("admin")) <= 1) throw new UserError("Debe quedar al menos un administrador");
  await ProjectModel.detachUser(v.id);
  await UserModel.remove(v.id);
}
