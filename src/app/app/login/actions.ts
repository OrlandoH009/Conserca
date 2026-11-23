"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as AuthController from "@/controllers/auth.controller";

// sent: se mandó un enlace a ese correo; unverified: falta confirmar el correo (se ofrece reenviarlo).
export type LoginState = { error?: string; email?: string; sent?: string; unverified?: boolean };

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const r = await AuthController.login(fd);
  // Las cuentas "usuario" no tienen panel: van a ver sus proyectos.
  if (r.ok) redirect(r.role === "usuario" ? "/mis-proyectos" : "/app");
  return { error: r.error, email: r.email, unverified: r.unverified };
}

/** Registro: no entra todavía; primero tiene que abrir el enlace que le llega al correo. */
export async function register(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const r = await AuthController.register(fd);
  return { error: r.error, email: r.email, sent: r.sent };
}

export async function resendVerification(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const r = await AuthController.resendVerification(fd);
  return { error: r.error, sent: r.sent };
}

export async function requestReset(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const r = await AuthController.requestReset(fd);
  return { error: r.error, sent: r.sent };
}

export async function resetPassword(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const r = await AuthController.resetPassword(fd);
  if (r.ok) redirect(r.role === "usuario" ? "/mis-proyectos" : "/app");
  return { error: r.error };
}

export async function logout() {
  await AuthController.logout();
  redirect("/app/login");
}

/** Cerrar sesión desde el sitio público: se queda en el sitio. */
export async function logoutSite() {
  await AuthController.logout();
  redirect("/");
}

export type ProfileState = { ok?: boolean; error?: string };

export async function updateProfile(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const r = await AuthController.updateProfile(fd);
  if (r.ok) revalidatePath("/", "layout"); // el nombre de la barra se actualiza
  return { ok: r.ok, error: r.error };
}
