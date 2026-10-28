import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/site/BackButton";
import { currentUser } from "@/lib/auth";
import * as PortalController from "@/controllers/portal.controller";
import { CotizarForm } from "./CotizarForm";
import { QuickForm } from "./QuickForm";

export const metadata: Metadata = { title: "Solicitar cotización" };

// Sin sesión: cotización rápida. Con sesión: cotización personalizada con los datos de la cuenta.
export default async function Cotizar() {
  const u = await currentUser();
  const mine = u ? await PortalController.projectCount(u.id) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-20 sm:px-6 sm:pb-28 sm:pt-32">
      <BackButton />
      {u ? (
        <>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Tu cotización personalizada</h1>
          <p className="mb-6 mt-2 text-sm text-mute sm:mb-8 sm:mt-3 sm:text-base">
            Hola, {u.name.split(" ")[0]}. Cuéntanos de tu proyecto con unas opciones sencillas; ya tenemos tus datos de contacto.
            {mine > 0 && <> Tus proyectos actuales los ves en <Link href="/mis-proyectos" className="font-semibold text-accent hover:underline">Mis proyectos</Link>.</>}
          </p>
          <CotizarForm user={{ name: u.name, email: u.email, phone: u.phone }} />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Solicitar cotización</h1>
          <p className="mb-6 mt-2 text-sm text-mute sm:mb-8 sm:mt-3 sm:text-base">Déjanos tus datos y cuéntanos qué necesitas. Te contactamos sin necesidad de crear una cuenta.</p>
          <QuickForm />

          <div className="mt-8 rounded-3xl border border-line bg-surface p-5 sm:mt-10 sm:p-8 md:p-10">
            <h2 className="text-xl font-semibold tracking-tight">¿Quieres una cotización más personalizada?</h2>
            <p className="mt-2 text-sm text-mute sm:text-base">Con una cuenta eliges tipo de espacio, servicios, tamaño, etapa, horario y más, y después ves en tu cuenta el avance de tu proyecto y los documentos en PDF que vamos entregando.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/login?registro=1" className="btn btn-lg">Crear cuenta</Link>
              <Link href="/app/login" className="btn-ghost btn-lg">Iniciar sesión</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
