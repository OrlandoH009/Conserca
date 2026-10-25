import bcrypt from "bcryptjs";
import { z } from "zod";
import { parse, UserError } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import { ROLES } from "@/lib/permissions";
import * as UserModel from "@/models/user.model";

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
