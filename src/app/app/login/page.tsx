import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n-server";
import { AuthShell } from "./AuthShell";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Iniciar sesión") };
}

export default async function LoginPage({ searchParams }: PageProps<"/app/login">) {
  const me = await currentUser();
  if (me) redirect(me.role === "usuario" ? "/" : "/app");
  const sp = await searchParams;
  // Vuelve aquí desde el enlace del correo de confirmación cuando ya no sirve o ya se usó.
  const notice = sp.enlace === "vencido" ? "El enlace venció o no es válido. Inicia sesión y te ofreceremos mandarte otro." : sp.enlace === "confirmado" ? "Tu correo ya estaba confirmado. Inicia sesión." : undefined;
  return <AuthShell initial={sp.registro ? "registro" : "login"} notice={notice} />;
}
