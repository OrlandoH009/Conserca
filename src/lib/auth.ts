import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import * as UserModel from "@/models/user.model";
import { can, type Area } from "./permissions";
import { cookieOptions, SESSION_COOKIE, signToken, verifyToken } from "./token";

/** `remember`: la sesión no vence hasta que la persona la cierre; si no, 12 horas o hasta cerrar el navegador. */
export async function startSession(userId: number, remember = false) {
  (await cookies()).set(SESSION_COOKIE, await signToken(userId, remember), cookieOptions(remember));
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Usuario actual leído de la base (el rol siempre es el vigente, no el del token). */
export const currentUser = cache(async () => {
  const uid = await verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  return UserModel.findPublicById(uid);
});

/** Para páginas: sin sesión va al login; sin permiso vuelve al panel. */
export async function requireAccess(area: Area, need: "view" | "edit" = "view") {
  const u = await currentUser();
  if (!u) redirect("/app/login");
  if (!can(u.role, area, need)) redirect("/app?sinpermiso=1");
  return u;
}

/** Para acciones del servidor: lanza error si no hay permiso. */
export async function assertAccess(area: Area, need: "view" | "edit" = "edit") {
  const u = await currentUser();
  if (!u || !can(u.role, area, need)) throw new Error("Sin permiso");
  return u;
}
