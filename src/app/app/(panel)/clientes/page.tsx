import { getT } from "@/lib/i18n-server";
import { FilterMenu } from "@/components/app/FilterMenu";
import type { Metadata } from "next";
import Link from "next/link";
import * as ClientController from "@/controllers/client.controller";
import * as QuoteController from "@/controllers/quote.controller";
import { ActionButton } from "@/components/app/ActionButton";
import { ActionForm, F } from "@/components/app/ActionForm";
import { ContactOptions } from "@/components/app/ContactOptions";
import { EditDialog } from "@/components/app/EditDialog";
import { Badge, Empty, PageHead } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { CONFIG } from "@/lib/config";
import { can } from "@/lib/permissions";
import { detailRows } from "@/lib/quote-details";
import { ClientFields } from "./ClientFields";
import { addClient, contactQuote, convertQuote, rejectQuote, removeClient, removeQuote, updateClient } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Clientes y cotizaciones") };
}

const QS = { nueva: ["Nueva", "b"], en_proceso: ["En contacto", "a"], aceptada: ["Aceptada", "g"], rechazada: ["Rechazada", "r"] } as const;

export default async function Clientes({ searchParams }: PageProps<"/app/clientes">) {
  const t = await getT();
  const sp = await searchParams;
  const estado = typeof sp.estado === "string" && sp.estado in QS ? (sp.estado as keyof typeof QS) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(typeof sp.p === "string" ? sp.p : 1) || 1);

  const [quotes, clients, u] = await Promise.all([QuoteController.list({ estado, q, page }), ClientController.list(), currentUser()]);
  const canEdit = !!u && can(u.role, "clientes", "edit");
  const canAccept = !!u && can(u.role, "proyectos", "edit") && can(u.role, "cobros", "edit");
  const href = (over: Record<string, string>) => `/app/clientes?${new URLSearchParams({ ...(estado ? { estado } : {}), ...(q ? { q } : {}), ...over })}`;

  return (
    <>
      <PageHead title={t("Clientes y cotizaciones")} sub={t("Las solicitudes llegan desde el sitio, con o sin cuenta")} />
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Altura mínima para que la lista de filtros desplegada quepa dentro del recuadro (con aire abajo) aunque no haya resultados. */}
        <section className="card flex min-h-[26rem] flex-col">
          <h2 className="mb-3 font-bold">{t("Cotizaciones recibidas")} <span className="text-sm font-normal text-mute">({quotes.total})</span></h2>
          <div className="mb-4 flex gap-2">
            {/* Búsqueda con la lupa como botón dentro de la barra. */}
            <form role="search" className="relative min-w-0 flex-1">
              <input name="q" defaultValue={q} placeholder={t("Buscar nombre, teléfono o texto")} className="input w-full !pr-12" aria-label={t("Buscar cotizaciones")} />
              {estado && <input type="hidden" name="estado" value={estado} />}
              <button aria-label={t("Buscar")} className="absolute inset-y-1 right-1 flex w-10 cursor-pointer items-center justify-center rounded-lg text-mute transition-colors hover:bg-soft hover:text-accent active:scale-95">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              </button>
            </form>
            {/* Filtro por estado: se despliega, se elige uno y se cierra. */}
            <FilterMenu
              label={t("Filtrar por estado")}
              current={estado ?? ""}
              options={([["", "Todas"], ...Object.entries(QS).map(([k, [l]]) => [k, l])] as [string, string][]).map(([k, l]) => ({ key: k, label: l, href: `/app/clientes?${new URLSearchParams({ ...(k ? { estado: k } : {}), ...(q ? { q } : {}) })}` }))}
            />
          </div>

          {quotes.rows.length === 0 ? <Empty className="flex flex-1 items-center justify-center text-base">{estado || q ? t("No hay cotizaciones con ese filtro.") : t("Aún no llegan solicitudes.")}</Empty> : quotes.rows.map((x) => {
            const [label, tone] = QS[x.status];
            return (
              <article key={x.id} className="border-b border-slate-100 py-4 last:border-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {x.name} <span className="text-sm font-normal text-mute">· {fmtDateTime(x.createdAt)}</span>
                      {x.userId && <span className="ml-2 align-middle"><Badge tone="b">{t("Con cuenta")}</Badge></span>}
                    </p>
                    <p className="mt-1 text-sm text-mute">{[x.phone, x.email].filter(Boolean).join(" · ")}</p>
                  </div>
                  <Badge tone={tone}>{t(label)}</Badge>
                </div>

                {x.details ? (
                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                    {detailRows(x.details, t).map(([k, v]) => (
                      <div key={k} className="flex gap-2"><dt className="shrink-0 text-mute">{k}:</dt><dd className="font-medium">{v}</dd></div>
                    ))}
                  </dl>
                ) : <p className="mt-2 whitespace-pre-line text-sm text-mute">{x.message}</p>}

                {x.status === "rechazada" && x.rejectReason && <p className="mt-2 text-sm"><span className="text-mute">{t("Motivo del rechazo:")}</span> {x.rejectReason}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {canEdit && x.status !== "rechazada" && (
                    <EditDialog label={t("Contactar")} title={t("Contactar a {name}", { name: x.name })} className="btn-ghost px-3 py-1.5 text-xs">
                      <ContactOptions id={x.id} action={contactQuote} phone={x.phone} email={x.email} />
                    </EditDialog>
                  )}
                  {x.projectId ? (
                    <Link href={`/app/proyectos/${x.projectId}`} className="text-sm font-semibold text-accent hover:underline">{t("Ver el proyecto creado →")}</Link>
                  ) : x.status !== "rechazada" && canAccept && (
                    <EditDialog label={t("Aceptar")} title={t("Aceptar solicitud y crear proyecto")} className="btn px-3 py-1.5 text-xs">
                      <ActionForm action={convertQuote} submit={t("Crear proyecto")} success={t("Proyecto creado")}>
                        <input type="hidden" name="id" value={x.id} />
                        <div className="space-y-3">
                          <F label={t("Nombre del proyecto")} name="name" defaultValue={`${x.details?.space ?? "Proyecto"} · ${x.name}`} />
                          <F label={t("Tipo de espacio")} name="spaceType" defaultValue={x.details?.space ?? ""} placeholder={t("Oficinas, estacionamiento, bodega…")} />
                          <F label={t("Honorarios del diseño ({currency})", { currency: CONFIG.currency })} name="total" type="number" step="any" />
                          <F label={t("Fecha límite")} name="dueDate" type="date" />
                        </div>
                        <p className="mt-3 text-xs text-mute">
                          {x.userId ? t("Se crea el cliente y se liga su cuenta, para que vea el avance en «Mis proyectos». Los honorarios se reparten en Cobro inicial y Cobro final.") : t("Se crea el cliente. Los honorarios se reparten en Cobro inicial y Cobro final.")}
                        </p>
                      </ActionForm>
                    </EditDialog>
                  )}
                  {canEdit && !x.projectId && x.status !== "rechazada" && (
                    <EditDialog label={t("Rechazar")} title={t("Rechazar la solicitud de {name}", { name: x.name })} className="btn-ghost px-3 py-1.5 text-xs">
                      <ActionForm action={rejectQuote} submit={t("Rechazar")} success={t("Solicitud rechazada")}>
                        <input type="hidden" name="id" value={x.id} />
                        <label className="label" htmlFor={`reason-${x.id}`}>{t("Motivo del rechazo")}</label>
                        <textarea id={`reason-${x.id}`} name="reason" className="input" required minLength={3} maxLength={500} />
                        <p className="mt-2 text-xs text-mute">{x.userId ? t("La persona verá este motivo en su cuenta.") : t("Esta persona no tiene cuenta: el motivo queda solo aquí. Avísale por WhatsApp.")}</p>
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
                {/* Celular: un botón pequeño a la página del cliente (editar si tiene permiso, si no solo ver). */}
                <Link href={`/app/clientes/${c.id}`} className="btn-ghost btn-line shrink-0 px-3 py-1.5 text-xs sm:hidden">{canEdit ? t("Ver y editar") : t("Ver detalles")}</Link>
                {canEdit && (
                  <div className="hidden shrink-0 items-center gap-3 text-xs sm:flex">
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
            // Como "+ Nuevo proyecto": un botón del ancho de la tarjeta que abre el formulario en un modal grande.
            <EditDialog size="lg" label={t("+ Agregar cliente")} title={t("Agregar cliente")} className="card block w-full cursor-pointer text-left font-bold transition-colors hover:text-accent">
              <ActionForm action={addClient} success={t("Cliente agregado")}><ClientFields /></ActionForm>
            </EditDialog>
          )}
        </div>
      </div>
    </>
  );
}
