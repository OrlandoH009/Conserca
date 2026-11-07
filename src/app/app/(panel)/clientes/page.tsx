import { getT } from "@/lib/i18n-server";
import type { Metadata } from "next";
import Link from "next/link";
import * as ClientController from "@/controllers/client.controller";
import * as QuoteController from "@/controllers/quote.controller";
import { ActionButton } from "@/components/app/ActionButton";
import { ActionForm, F } from "@/components/app/ActionForm";
import { AutoSelect } from "@/components/app/AutoSelect";
import { EditDialog } from "@/components/app/EditDialog";
import { Badge, Empty, PageHead } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { can } from "@/lib/permissions";
import { detailRows } from "@/lib/quote-details";
import { whatsappLink } from "@/lib/whatsapp";
import { addClient, convertQuote, removeClient, removeQuote, setQuoteStatus, updateClient } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Clientes y cotizaciones") };
}

const QS = { nueva: ["Nueva", "b"], en_proceso: ["En proceso", "a"], respondida: ["Respondida", "g"] } as const;
const LINK = "inline-flex items-center rounded-full border border-line px-3 py-1 text-xs font-semibold text-accent transition hover:bg-soft";

async function ClientFields({ c }: { c?: { name: string; contact: string | null; email: string | null; phone: string | null; taxId: string | null; billingEmail: string | null; authorizer: string | null } }) {
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

export default async function Clientes({ searchParams }: PageProps<"/app/clientes">) {
  const t = await getT();
  const sp = await searchParams;
  const estado = typeof sp.estado === "string" && sp.estado in QS ? (sp.estado as keyof typeof QS) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(typeof sp.p === "string" ? sp.p : 1) || 1);

  const [quotes, clients, u] = await Promise.all([QuoteController.list({ estado, q, page }), ClientController.list(), currentUser()]);
  const canEdit = !!u && can(u.role, "clientes", "edit");
  const canProject = !!u && can(u.role, "proyectos", "edit");
  const href = (over: Record<string, string>) => `/app/clientes?${new URLSearchParams({ ...(estado ? { estado } : {}), ...(q ? { q } : {}), ...over })}`;

  return (
    <>
      <PageHead title={t("Clientes y cotizaciones")} sub={t("Las solicitudes llegan desde el sitio, con o sin cuenta")} />
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="card">
          <h2 className="mb-3 font-bold">{t("Cotizaciones recibidas")} <span className="text-sm font-normal text-mute">({quotes.total})</span></h2>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <form className="flex flex-1 gap-2 sm:flex-none">
              <input name="q" defaultValue={q} placeholder={t("Buscar nombre, teléfono o texto")} className="input w-full sm:w-64" aria-label={t("Buscar cotizaciones")} />
              {estado && <input type="hidden" name="estado" value={estado} />}
              <button className="btn-ghost">{t("Buscar")}</button>
            </form>
            <Link href={`/app/clientes${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={`badge px-3 py-1.5 ${!estado ? "bg-soft text-accent" : "bg-surface text-mute ring-1 ring-line"}`}>{t("Todas")}</Link>
            {Object.entries(QS).map(([k, [l]]) => (
              <Link key={k} href={`/app/clientes?${new URLSearchParams({ estado: k, ...(q ? { q } : {}) })}`} className={`badge px-3 py-1.5 ${estado === k ? "bg-soft text-accent" : "bg-surface text-mute ring-1 ring-line"}`}>{t(l)}</Link>
            ))}
          </div>

          {quotes.rows.length === 0 ? <Empty>{estado || q ? t("No hay cotizaciones con ese filtro.") : t("Aún no llegan solicitudes.")}</Empty> : quotes.rows.map((x) => {
            const [label, tone] = QS[x.status];
            const hello = t("Hola {name}, te escribimos de Conserca por tu solicitud de cotización.", { name: x.name.split(" ")[0] });
            return (
              <article key={x.id} className="border-b border-slate-100 py-4 last:border-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {x.name} <span className="text-sm font-normal text-mute">· {fmtDateTime(x.createdAt)}</span>
                      {x.userId && <span className="ml-2 align-middle"><Badge tone="b">{t("Con cuenta")}</Badge></span>}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {x.phone && <a href={`tel:${x.phone.replace(/[^\d+]/g, "")}`} className={LINK}>📞 {x.phone}</a>}
                      {x.phone && <a href={whatsappLink(x.phone, hello)} target="_blank" rel="noopener noreferrer" className={LINK}>{t("WhatsApp")}</a>}
                      {x.email && <a href={`mailto:${x.email}?subject=${encodeURIComponent(t("Tu cotización en Conserca"))}`} className={LINK}>✉ {x.email}</a>}
                    </div>
                  </div>
                  {canEdit ? (
                    <AutoSelect key={x.status} name="status" value={x.status} options={Object.entries(QS).map(([k, [l]]) => [k, l])} action={setQuoteStatus} fields={{ id: x.id }} label={t("Estado de la cotización de {name}", { name: x.name })} okText={t("Estado de la cotización actualizado")} className="input h-9 w-36 text-xs" />
                  ) : <Badge tone={tone}>{t(label)}</Badge>}
                </div>

                {x.details ? (
                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                    {detailRows(x.details, t).map(([k, v]) => (
                      <div key={k} className="flex gap-2"><dt className="shrink-0 text-mute">{k}:</dt><dd className="font-medium">{v}</dd></div>
                    ))}
                  </dl>
                ) : <p className="mt-2 whitespace-pre-line text-sm text-mute">{x.message}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {x.projectId ? (
                    <Link href={`/app/proyectos/${x.projectId}`} className="text-sm font-semibold text-accent hover:underline">{t("Ver el proyecto creado →")}</Link>
                  ) : canProject && (
                    <EditDialog label={t("Crear proyecto con esta cotización")} title={t("Crear proyecto")} className="btn-ghost px-3 py-1.5 text-xs">
                      <ActionForm action={convertQuote} submit={t("Crear proyecto")} success={t("Proyecto creado")}>
                        <input type="hidden" name="id" value={x.id} />
                        <div className="space-y-3">
                          <F label={t("Nombre del proyecto")} name="name" defaultValue={`${x.details?.space ?? "Proyecto"} · ${x.name}`} />
                          <F label={t("Tipo de espacio")} name="spaceType" defaultValue={x.details?.space ?? ""} placeholder={t("Oficinas, estacionamiento, bodega…")} />
                        </div>
                        <p className="mt-3 text-xs text-mute">
                          {x.userId ? t("Se crea el cliente y se liga su cuenta, para que vea el avance en «Mis proyectos». La cotización pasa a «En proceso».") : t("Se crea el cliente. La cotización pasa a «En proceso».")}
                        </p>
                      </ActionForm>
                    </EditDialog>
                  )}
                  {canEdit && (
                    <ActionButton action={removeQuote} fields={{ id: x.id }} confirm={t("¿Eliminar la cotización de {name}? No se puede deshacer.", { name: x.name })} okText={t("Cotización eliminada")} className="text-sm font-semibold text-red-600 hover:underline">{t("Eliminar")}</ActionButton>
                  )}
                </div>
              </article>
            );
          })}

          {quotes.pages > 1 && (
            <nav aria-label={t("Páginas")} className="mt-4 flex items-center justify-between text-sm">
              {quotes.page > 1 ? <Link href={href({ p: String(quotes.page - 1) })} className="font-semibold text-accent hover:underline">{t("← Anteriores")}</Link> : <span />}
              <span className="text-mute">{t("Página {page} de {pages}", { page: quotes.page, pages: quotes.pages })}</span>
              {quotes.page < quotes.pages ? <Link href={href({ p: String(quotes.page + 1) })} className="font-semibold text-accent hover:underline">{t("Siguientes →")}</Link> : <span />}
            </nav>
          )}
        </section>

        <div className="space-y-5">
          <section className="card">
            <h2 className="mb-3 font-bold">{t("Clientes")}</h2>
            {clients.length === 0 ? <Empty>{t("Aún no hay clientes.")}</Empty> : clients.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
                <div className="min-w-0">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-mute">{[c.contact, c.email, c.phone].filter(Boolean).join(" · ") || t("Sin datos de contacto")}</p>
                </div>
                {canEdit && (
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <EditDialog label={t("Editar")} title={t("Editar a {name}", { name: c.name })} className="font-semibold text-accent hover:underline">
                      <ActionForm action={updateClient} submit={t("Guardar cambios")} success={t("Cliente actualizado")}>
                        <input type="hidden" name="id" value={c.id} />
                        <ClientFields c={c} />
                      </ActionForm>
                    </EditDialog>
                    <ActionButton action={removeClient} fields={{ id: c.id }} confirm={t("¿Eliminar a {name}?", { name: c.name })} okText={t("Cliente eliminado")} className="font-semibold text-red-600 hover:underline">{t("Eliminar")}</ActionButton>
                  </div>
                )}
              </div>
            ))}
          </section>
          {canEdit && (
            <section className="card">
              <h2 className="mb-3 font-bold">{t("Agregar cliente")}</h2>
              <ActionForm action={addClient} success={t("Cliente agregado")}><ClientFields /></ActionForm>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
