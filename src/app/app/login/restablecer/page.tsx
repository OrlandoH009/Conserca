import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { getT } from "@/lib/i18n-server";
import { ResetForm } from "./ResetForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Cambiar contraseña") };
}

/** Sin `t`: pide el correo para mandar el enlace. Con `t` (viene del correo): pide la contraseña nueva. */
export default async function Restablecer({ searchParams }: PageProps<"/app/login/restablecer">) {
  const t = await getT();
  const { t: token } = await searchParams;
  const link = typeof token === "string" && token ? token : undefined;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <Link href="/" aria-label={t("Conserca, ir al inicio")} className="inline-flex"><Logo className="h-9" /></Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">{link ? t("Crea tu contraseña nueva") : t("¿Olvidaste tu contraseña?")}</h1>
        <p className="mb-6 mt-2 text-sm text-mute">
          {link ? t("Escríbela dos veces. Después entrarás directo a tu cuenta.") : t("Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.")}
        </p>
        <ResetForm token={link} />
        <Link href="/app/login" className="mt-6 inline-flex items-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-accent transition hover:bg-soft active:scale-95">{t("← Volver a iniciar sesión")}</Link>
      </div>
    </main>
  );
}
