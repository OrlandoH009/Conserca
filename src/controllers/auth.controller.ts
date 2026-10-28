import bcrypt from "bcryptjs";
import { z } from "zod";
import { currentUser, endSession, startSession } from "@/lib/auth";
import * as UserModel from "@/models/user.model";

// Límite sencillo de intentos fallidos por correo (en memoria; basta para uso local).
const fails = new Map<string, { n: number; until: number }>();
const DUMMY = bcrypt.hashSync("no-existe", 10);

type LoginResult = { ok?: boolean; error?: string; email?: string; role?: string };

export async function login(fd: FormData): Promise<LoginResult> {
  const p = z.object({ email: z.email().transform((s) => s.toLowerCase().trim()), password: z.string().min(1) }).safeParse({
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
  });
  if (!p.success) return { error: "Escribe tu correo y contraseña", email: String(fd.get("email") ?? "") };

  const f = fails.get(p.data.email);
  if (f && f.n >= 5 && f.until > Date.now()) return { error: "Demasiados intentos. Espera unos minutos.", email: p.data.email };

  const u = await UserModel.findByEmail(p.data.email);
  const ok = await bcrypt.compare(p.data.password, u?.passwordHash ?? DUMMY);
  if (!u || !ok) {
    fails.set(p.data.email, { n: (f && f.until > Date.now() ? f.n : 0) + 1, until: Date.now() + 10 * 60_000 });
    return { error: "Correo o contraseña incorrectos", email: p.data.email };
  }
  fails.delete(p.data.email);
  await startSession(u.id);
  return { ok: true, role: u.role };
}

export const logout = () => endSession();

/** Alta pública: siempre crea una cuenta "usuario" (sin acceso al panel); el rol no viene del formulario. */
export async function register(fd: FormData): Promise<LoginResult> {
  if (fd.get("website")) return { ok: true }; // campo trampa para bots
  if (!fd.get("terms")) return { error: "Acepta los Términos y condiciones para crear tu cuenta", email: String(fd.get("email") ?? "") };
  const p = z
    .object({
      name: z.string().trim().min(2, "Escribe tu nombre").max(120),
      email: z.email("Escribe un correo válido").transform((s) => s.toLowerCase().trim()),
      phone: z.string().trim().regex(/^[+\d][\d\s().-]{6,}$/, "Escribe un teléfono o WhatsApp válido").max(40),
      password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres").max(100),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" })
    .safeParse(Object.fromEntries(["name", "email", "phone", "password", "confirm"].map((k) => [k, String(fd.get(k) ?? "")])));
  if (!p.success) return { error: p.error.issues[0].message, email: String(fd.get("email") ?? "") };
  if (await UserModel.findByEmail(p.data.email)) return { error: "Ya existe una cuenta con ese correo", email: p.data.email };

  await UserModel.create({ name: p.data.name, email: p.data.email, phone: p.data.phone, role: "usuario", passwordHash: await bcrypt.hash(p.data.password, 10) });
  const u = await UserModel.findByEmail(p.data.email);
  await startSession(u!.id);
  return { ok: true, role: "usuario" };
}

const PHONE = /^[+\d][\d\s().-]{6,}$/;

/** Edita el perfil propio. El correo no se toca; cambiar teléfono o contraseña exige la contraseña actual. */
export async function updateProfile(fd: FormData): Promise<LoginResult> {
  const me = await currentUser();
  if (!me) return { error: "Inicia sesión de nuevo" };
  const full = await UserModel.findWithHash(me.id);
  if (!full) return { error: "Inicia sesión de nuevo" };

  const p = z
    .object({
      name: z.string().trim().min(2, "Escribe tu nombre").max(120),
      phone: z.string().trim().max(40).refine((v) => v === "" || PHONE.test(v), "Escribe un teléfono o WhatsApp válido"),
      newPassword: z.string().max(100),
      confirm: z.string(),
      current: z.string(),
    })
    .refine((v) => v.newPassword === "" || v.newPassword.length >= 10, { path: ["newPassword"], message: "La contraseña nueva debe tener al menos 10 caracteres" })
    .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Las contraseñas nuevas no coinciden" })
    .safeParse(Object.fromEntries(["name", "phone", "newPassword", "confirm", "current"].map((k) => [k, String(fd.get(k) ?? "")])));
  if (!p.success) return { error: p.error.issues[0].message };

  const phone = p.data.phone || null;
  const sensitive = phone !== (full.phone ?? null) || p.data.newPassword !== "";
  if (sensitive) {
    if (!p.data.current) return { error: "Escribe tu contraseña actual para confirmar el cambio" };
    if (!(await bcrypt.compare(p.data.current, full.passwordHash))) return { error: "La contraseña actual no es correcta" };
  }

  await UserModel.updateProfile(me.id, { name: p.data.name, phone });
  if (p.data.newPassword) await UserModel.setPassword(me.id, await bcrypt.hash(p.data.newPassword, 10));
  return { ok: true };
}
