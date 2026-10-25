import type { Metadata } from "next";
import * as ClientController from "@/controllers/client.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Badge, Empty, PageHead } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { can } from "@/lib/permissions";
import { addClient, setQuoteStatus } from "./actions";

export const metadata: Metadata = { title: "Clientes y cotizaciones" };

const QS = { nueva: ["Nueva", "b"], en_proceso: ["En proceso", "a"], respondida: ["Respondida", "g"] } as const;

export default async function Clientes() {
  const [{ quotes: qs, clients: cs }, u] = await Promise.all([ClientController.overview(), currentUser()]);
  const canEdit = !!u && can(u.role, "clientes", "edit");
  return (
    <>
      <PageHead title="Clientes y cotizaciones" sub="Las solicitudes llegan desde el sitio para usuarios" />
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="card">
          <h2 className="mb-3 font-bold">Cotizaciones recibidas</h2>
          {qs.length === 0 ? <Empty>Aún no llegan solicitudes.</Empty> : qs.map((q) => {
            const [label, tone] = QS[q.status];
            return (
              <article key={q.id} className="border-b border-slate-100 py-4 last:border-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{q.name} <span className="text-sm font-normal text-mute">· {fmtDateTime(q.createdAt)}</span></p>
                    <p className="text-sm text-accent">{q.contactMethod === "correo" ? `Correo: ${q.email}` : `Teléfono: ${q.phone}`}</p>
                  </div>
                  {canEdit ? (
                    <form action={setQuoteStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={q.id} />
                      <select name="status" defaultValue={q.status} className="input h-9 w-36 text-xs" aria-label={`Estado de la cotización de ${q.name}`}>
                        {Object.entries(QS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                      <button className="btn-ghost px-3 py-1.5">Guardar</button>
                    </form>
                  ) : <Badge tone={tone}>{label}</Badge>}
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-mute">{q.message}</p>
              </article>
            );
          })}
        </section>
        <div className="space-y-5">
          <section className="card">
            <h2 className="mb-3 font-bold">Clientes</h2>
            {cs.length === 0 ? <Empty>Aún no hay clientes.</Empty> : cs.map((c) => (
              <div key={c.id} className="border-b border-slate-100 py-2.5 last:border-0">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-mute">{[c.contact, c.email, c.phone].filter(Boolean).join(" · ") || "Sin datos de contacto"}</p>
              </div>
            ))}
          </section>
          {canEdit && (
            <section className="card">
              <h2 className="mb-3 font-bold">Agregar cliente</h2>
              <ActionForm action={addClient}>
                <div className="space-y-3">
                  <F label="Nombre" name="name" />
                  <F label="Contacto" name="contact" required={false} />
                  <F label="Correo" name="email" type="email" required={false} />
                  <F label="Teléfono" name="phone" required={false} />
                </div>
              </ActionForm>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
