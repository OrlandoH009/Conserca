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
  return <AuthShell initial={sp.registro ? "registro" : "login"} />;
}
