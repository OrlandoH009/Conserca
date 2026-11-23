import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import * as AuthController from "@/controllers/auth.controller";

/** Enlace del correo de confirmación: activa la cuenta, inicia sesión y lleva a cotizar (o al panel si es del equipo). */
export async function GET(req: NextRequest) {
  const role = await AuthController.verifyEmail(req.nextUrl.searchParams.get("t") ?? "");
  if (!role) redirect("/app/login?enlace=vencido");
  if (role === "ya") redirect("/app/login?enlace=confirmado");
  redirect(role === "usuario" ? "/cotizar" : "/app");
}
