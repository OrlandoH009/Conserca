import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Nav } from "@/components/site/Nav";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Página no encontrada") };
}

// Se muestra con cualquier dirección que no existe (el servidor responde 404).
export default async function NotFound() {
  const t = await getT();
  return (
    <>
      <Nav />
      <main className="flex min-h-[70vh] items-center justify-center px-6 pb-20 pt-32 text-center">
        <div>
          <p className="bg-gradient-to-r from-accent to-accent-solid-2 bg-clip-text text-8xl font-bold tracking-tight text-transparent sm:text-9xl">404</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{t("No encontramos esa página")}</h1>
          <p className="mx-auto mt-3 max-w-md text-mute">{t("Puede que la dirección esté mal escrita o que la página ya no exista. Te llevamos de vuelta a lo que sí tenemos.")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-lg">{t("Volver al inicio")}</Link>
            <Link href="/servicios" className="btn-ghost btn-lg">{t("Ver servicios")}</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
