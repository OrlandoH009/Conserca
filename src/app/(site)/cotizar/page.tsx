import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { CotizarForm } from "./CotizarForm";

export const metadata: Metadata = { title: "Solicitar cotización" };

export default async function Cotizar() {
  const u = await currentUser();
  if (!u) redirect("/app/login?registro=1"); // cotizar es solo para cuentas registradas
  return (
    <div className="mx-auto max-w-5xl px-6 pb-28 pt-32">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Solicitar cotización</h1>
      <p className="mb-8 mt-3 text-mute">Hola, {u.name.split(" ")[0]}. Elige las opciones que describen tu proyecto; lo demás ya lo tenemos de tu cuenta.</p>
      <CotizarForm user={{ name: u.name, email: u.email, phone: u.phone }} />
    </div>
  );
}
