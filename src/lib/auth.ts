import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import * as UserModel from "@/models/user.model";
import { can, type Area } from "./permissions";
import { SESSION_COOKIE, SESSION_DAYS, signToken, verifyToken } from "./token";

export async function startSession(userId: number) {
  (await cookies()).set(SESSION_COOKIE, await signToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
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
