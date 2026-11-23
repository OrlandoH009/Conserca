import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { z } from "zod";
import { currentUser, endSession, startSession } from "@/lib/auth";
import { appUrl, logMailError, sendEmail } from "@/lib/email";
import { PHONE_MSG, PHONE_RE } from "@/lib/format";
import { limited } from "@/lib/rate-limit";
import { readLink, signLink } from "@/lib/token";
import * as UserModel from "@/models/user.model";

// Límite sencillo de intentos fallidos por correo (en memoria; basta para uso local).
const fails = new Map<string, { n: number; until: number }>();
const DUMMY = bcrypt.hashSync("no-existe", 10);

// sent: a qué correo se mandó un enlace; unverified: la contraseña era correcta pero falta confirmar el correo.
type LoginResult = { ok?: boolean; error?: string; email?: string; role?: string; sent?: string; unverified?: boolean };

/** Huella de la contraseña guardada: al cambiarla, el enlace para cambiarla deja de servir (es de un solo uso). */
const fingerprint = (passwordHash: string) => createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);

async function sendVerification(u: { id: number; name: string; email: string }) {
  const token = await signLink("verify", { id: u.id, v: u.email }, "48h");
  await sendEmail(
    u.email,
    "Confirma tu correo en Conserca",
    [`Hola, ${u.name}:`, "Para activar tu cuenta en Conserca, confirma que este es tu correo. El enlace vence en 48 horas.", "Si tú no creaste esta cuenta, ignora este mensaje."],
    { label: "Confirmar mi correo", href: appUrl(`/app/login/verificar?t=${token}`) },
  );
}

export async function login(fd: FormData): Promise<LoginResult> {
  const p = z.object({ email: z.email().transform((s) => s.toLowerCase().trim()), password: z.string().min(1) }).safeParse({
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
  });
  if (!p.success) return { error: "Escribe tu correo y contraseña", email: String(fd.get("email") ?? "") };

  // Por IP (30 intentos / 10 min: cada intento gasta CPU en bcrypt; una oficina entera comparte IP) y por correo (5 fallos / 10 min).
  if (await limited("login", 30, 10 * 60_000)) return { error: "Demasiados intentos. Espera unos minutos.", email: p.data.email };
  const f = fails.get(p.data.email);
  if (f && f.n >= 5 && f.until > Date.now()) return { error: "Demasiados intentos. Espera unos minutos.", email: p.data.email };

  const u = await UserModel.findByEmail(p.data.email);
  const ok = await bcrypt.compare(p.data.password, u?.passwordHash ?? DUMMY);
  if (!u || !ok) {
    if (fails.size > 5000) for (const [k, v] of fails) if (v.until <= Date.now()) fails.delete(k); // no crece sin límite con correos inventados
    fails.set(p.data.email, { n: (f && f.until > Date.now() ? f.n : 0) + 1, until: Date.now() + 10 * 60_000 });
    return { error: "Correo o contraseña incorrectos", email: p.data.email };
  }
  fails.delete(p.data.email);
  // Se revisa después de la contraseña: así no se revela a cualquiera si una cuenta está confirmada o no.
  if (!u.emailVerifiedAt) return { error: "Confirma tu correo para entrar. Busca el enlace que te enviamos (revisa también la carpeta de spam).", email: p.data.email, unverified: true };
  await startSession(u.id, fd.get("remember") === "on");
  return { ok: true, role: u.role };
}

export const logout = () => endSession();

/** Alta pública: siempre crea una cuenta "usuario" (sin acceso al panel); el rol no viene del formulario. */
export async function register(fd: FormData): Promise<LoginResult> {
  if (fd.get("website")) return { ok: true }; // campo trampa para bots
  const p = z
    .object({
      name: z.string().trim().min(2, "Escribe tu nombre").max(120),
      email: z.email("Escribe un correo válido").transform((s) => s.toLowerCase().trim()),
      phone: z.string().trim().regex(PHONE_RE, PHONE_MSG).max(40),
      password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres").max(100),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" })
    .safeParse(Object.fromEntries(["name", "email", "phone", "password", "confirm"].map((k) => [k, String(fd.get(k) ?? "")])));
  if (!p.success) return { error: p.error.issues[0].message, email: String(fd.get("email") ?? "") };
  if (!fd.get("terms")) return { error: "Acepta los Términos y condiciones para crear tu cuenta", email: p.data.email };
  if (await limited("register", 5, 60 * 60_000)) return { error: "Demasiados intentos. Espera unos minutos.", email: p.data.email }; // solo cuenta el envío válido
  if (await UserModel.findByEmail(p.data.email)) return { error: "Ya existe una cuenta con ese correo", email: p.data.email };

  await UserModel.create({ name: p.data.name, email: p.data.email, phone: p.data.phone, role: "usuario", passwordHash: await bcrypt.hash(p.data.password, 10) });
  const u = await UserModel.findByEmail(p.data.email);
  // La cuenta queda sin confirmar: la sesión empieza cuando abra el enlace del correo.
  try {
    await sendVerification(u!);
  } catch (e) {
    logMailError(e);
    return { ok: true, sent: p.data.email, error: "Creamos tu cuenta, pero no pudimos enviar el correo. Toca «Reenviar correo de confirmación» en un momento." };
  }
  return { ok: true, sent: p.data.email };
}

/** Vuelve a mandar el enlace de confirmación. Responde lo mismo exista o no la cuenta, para no revelar qué correos están registrados. */
export async function resendVerification(fd: FormData): Promise<LoginResult> {
  const email = String(fd.get("email") ?? "").toLowerCase().trim();
  if (await limited("verify-mail", 3, 60 * 60_000)) return { error: "Demasiados intentos. Espera unos minutos.", email };
  const u = email ? await UserModel.findByEmail(email) : null;
  if (u && !u.emailVerifiedAt) void sendVerification(u).catch(logMailError); // sin esperar: la respuesta tarda lo mismo haya cuenta o no
  return { sent: email };
}

/** Enlace del correo de confirmación: activa la cuenta e inicia sesión. Devuelve el rol; "ya" si ya estaba confirmada (no abre sesión: el enlace no es una llave de entrada); null si no sirve. */
export async function verifyEmail(token: string) {
  const link = await readLink("verify", token);
  const u = link ? await UserModel.findWithHash(link.id) : null;
  if (!link || !u || u.email !== link.v) return null;
  if (u.emailVerifiedAt) return "ya";
  await UserModel.markVerified(u.id);
  await startSession(u.id);
  return u.role;
}

/** «Olvidé mi contraseña»: manda un enlace de 1 hora y de un solo uso. Responde lo mismo exista o no la cuenta. */
export async function requestReset(fd: FormData): Promise<LoginResult> {
  const p = z.email().safeParse(String(fd.get("email") ?? "").toLowerCase().trim());
  if (!p.success) return { error: "Escribe un correo válido" };
  if (await limited("reset-mail", 5, 60 * 60_000)) return { error: "Demasiados intentos. Espera unos minutos.", email: p.data };
  const u = await UserModel.findByEmail(p.data);
  if (u) {
    const token = await signLink("reset", { id: u.id, v: fingerprint(u.passwordHash) }, "1h");
    void sendEmail(
      u.email,
      "Cambia tu contraseña de Conserca",
      [`Hola, ${u.name}:`, "Recibimos una solicitud para cambiar la contraseña de tu cuenta. El enlace vence en 1 hora y solo sirve una vez.", "Si no fuiste tú, ignora este mensaje: tu contraseña sigue igual."],
      { label: "Cambiar mi contraseña", href: appUrl(`/app/login/restablecer?t=${token}`) },
    ).catch(logMailError);
  }
  return { sent: p.data };
}

/** Guarda la contraseña nueva desde el enlace del correo e inicia sesión. Abrir ese enlace también confirma el correo. */
export async function resetPassword(fd: FormData): Promise<LoginResult> {
  const p = z
    .object({
      t: z.string().min(1, "El enlace no es válido. Pide uno nuevo."),
      password: z.string().min(10, "La contraseña debe tener al menos 10 caracteres").max(100),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" })
    .safeParse(Object.fromEntries(["t", "password", "confirm"].map((k) => [k, String(fd.get(k) ?? "")])));
  if (!p.success) return { error: p.error.issues[0].message };
  const link = await readLink("reset", p.data.t);
  const u = link ? await UserModel.findWithHash(link.id) : null;
  if (!link || !u || fingerprint(u.passwordHash) !== link.v) return { error: "El enlace venció o ya se usó. Pide uno nuevo." };
  await UserModel.setPassword(u.id, await bcrypt.hash(p.data.password, 10));
  if (!u.emailVerifiedAt) await UserModel.markVerified(u.id);
  fails.delete(u.email);
  await startSession(u.id);
  return { ok: true, role: u.role };
}

/** Edita el perfil propio. El correo no se toca; cambiar teléfono o contraseña exige la contraseña actual. */
export async function updateProfile(fd: FormData): Promise<LoginResult> {
  const me = await currentUser();
  if (!me) return { error: "Inicia sesión de nuevo" };
  const full = await UserModel.findWithHash(me.id);
  if (!full) return { error: "Inicia sesión de nuevo" };

  const p = z
    .object({
      name: z.string().trim().min(2, "Escribe tu nombre").max(120),
      phone: z.string().trim().max(40).refine((v) => v === "" || PHONE_RE.test(v), PHONE_MSG),
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
