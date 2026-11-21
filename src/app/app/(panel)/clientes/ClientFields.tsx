import { getT } from "@/lib/i18n-server";
import { F } from "@/components/app/ActionForm";

/** Campos del cliente: los usan "Agregar cliente", "Editar" y la página del cliente. */
export async function ClientFields({ c }: { c?: { name: string; contact: string | null; email: string | null; phone: string | null; taxId: string | null; billingEmail: string | null; authorizer: string | null } }) {
  const t = await getT();
  return (
    <div className="space-y-3">
      <F label={t("Nombre")} name="name" defaultValue={c?.name} />
      <F label={t("Contacto")} name="contact" required={false} defaultValue={c?.contact ?? ""} />
      <F label={t("Correo")} name="email" type="email" required={false} defaultValue={c?.email ?? ""} />
      <F label={t("Teléfono")} name="phone" required={false} defaultValue={c?.phone ?? ""} />
      <p className="label pt-2">{t("Para facturar")}</p>
      <F label={t("NIT / NRC")} name="taxId" required={false} defaultValue={c?.taxId ?? ""} />
      <F label={t("Correo para enviar la factura")} name="billingEmail" type="email" required={false} defaultValue={c?.billingEmail ?? ""} />
      <F label={t("Quién autoriza que se facture")} name="authorizer" required={false} defaultValue={c?.authorizer ?? ""} />
    </div>
  );
}
