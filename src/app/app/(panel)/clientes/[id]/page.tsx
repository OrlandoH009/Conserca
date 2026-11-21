import { getT } from "@/lib/i18n-server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as ClientController from "@/controllers/client.controller";
import { ActionButton } from "@/components/app/ActionButton";
import { ActionForm } from "@/components/app/ActionForm";
import { PageHead } from "@/components/app/ui";
import { BackButton } from "@/components/site/BackButton";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { removeClientAndBack, updateClient } from "../actions";
import { ClientFields } from "../ClientFields";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Cliente") };
}

/** Página de un cliente (sobre todo para celular): edita sus datos si el rol puede; si no, solo los muestra. */
export default async function Cliente({ params }: PageProps<"/app/clientes/[id]">) {
  const t = await getT();
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();
  const [c, me] = await Promise.all([ClientController.get(n), currentUser()]);
  if (!c) notFound();
  const canEdit = !!me && can(me.role, "clientes", "edit");

  const head = (
    <>
      <BackButton fallback="/app/clientes" />
      <p className="text-sm text-mute"><Link href="/app/clientes" className="hover:text-accent">{t("Clientes y cotizaciones")}</Link> / {c.name}</p>
    </>
  );

  if (!canEdit) {
    const rows: [string, string | null][] = [[t("Nombre"), c.name], [t("Contacto"), c.contact], [t("Correo"), c.email], [t("Teléfono"), c.phone], [t("NIT / NRC"), c.taxId], [t("Correo para enviar la factura"), c.billingEmail], [t("Quién autoriza que se facture"), c.authorizer]];
    return (
      <>
        {head}
        <PageHead title={c.name} sub={t("Tu rol solo permite consultar estos datos.")} />
        <dl className="card max-w-xl divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <dt className="text-sm text-mute">{k}</dt>
              <dd className="min-w-0 truncate text-right font-medium">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      </>
    );
  }

  return (
    <>
      {head}
      <PageHead title={t("Editar cliente")} sub={t("Cambia sus datos de contacto y de facturación.")} />
      <section className="card max-w-xl">
        <ActionForm action={updateClient} submit={t("Guardar cambios")} success={t("Cliente actualizado")}>
          <input type="hidden" name="id" value={c.id} />
          <ClientFields c={c} />
        </ActionForm>
      </section>
      <section className="card mt-6 max-w-xl border-red-200">
        <h2 className="font-bold text-red-700">{t("Eliminar cliente")}</h2>
        <p className="mt-1 text-sm text-mute">{t("Solo se puede eliminar si no tiene proyectos.")}</p>
        <ActionButton action={removeClientAndBack} fields={{ id: c.id }} confirm={t("¿Eliminar a {name}?", { name: c.name })} okText={t("Cliente eliminado")} className="btn mt-4 bg-red-600 hover:shadow-red-600/30">{t("Eliminar cliente")}</ActionButton>
      </section>
    </>
  );
}
