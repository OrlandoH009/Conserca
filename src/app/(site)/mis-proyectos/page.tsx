import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as PortalController from "@/controllers/portal.controller";
import * as QuoteController from "@/controllers/quote.controller";
import { ActionButton } from "@/components/app/ActionButton";
import { ActionForm } from "@/components/app/ActionForm";
import { EditDialog } from "@/components/app/EditDialog";
import { Badge, ProgressBar, StatusBadge } from "@/components/app/ui";
import { BackButton } from "@/components/site/BackButton";
import { StageStepper } from "@/components/site/StageStepper";
import { currentUser } from "@/lib/auth";
import { fmtDate, fmtDateTime, isoDay, todayISO } from "@/lib/format";
import { fmtMB } from "@/lib/pdf";
import { projectCode } from "@/lib/project";
import { reviewDocument, reviewDocumentForm } from "./actions";

export const metadata: Metadata = { title: "Mis proyectos" };

const DOC_STATUS = { en_proceso: ["En proceso", "b"], en_revision: ["En revisión", "a"], entregado: ["Entregado", "g"] } as const;
const DOC_KIND: Record<string, string> = { memoria: "Memoria de cálculo", especificaciones: "Especificaciones", presupuesto: "Presupuesto" };
const QUOTE_STATUS = { nueva: ["Recibida", "b"], en_proceso: ["En revisión del equipo", "a"], respondida: ["Respondida", "g"] } as const;

/** Texto de plazo: cuántos días faltan para la entrega o cuánto se pasó. */
function plazo(due: string | null, delivered: boolean) {
  if (!due || delivered) return null;
  const days = Math.round((new Date(due).getTime() - new Date(todayISO()).getTime()) / 864e5);
  if (days > 0) return `Faltan ${days} ${days === 1 ? "día" : "días"}`;
  if (days === 0) return "Se entrega hoy";
  return `Pasaron ${-days} ${days === -1 ? "día" : "días"} de la fecha`;
}

function Dato({ label, children, sub }: { label: string; children: React.ReactNode; sub?: string | null }) {
  return (
    <div className="rounded-2xl bg-bg px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-mute">{label}</p>
      <div className="mt-1 font-semibold">{children}</div>
      {sub && <p className="mt-0.5 text-xs text-mute">{sub}</p>}
    </div>
  );
}

export default async function MisProyectos() {
  const u = await currentUser();
  if (!u) redirect("/app/login");
  const [rows, quotes] = await Promise.all([PortalController.projectsOf(u.id), QuoteController.mine()]);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6 sm:pb-28 sm:pt-32">
      <BackButton />
      <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Mis proyectos</h1>
      <p className="mb-6 mt-2 text-sm text-mute sm:mb-8 sm:mt-3 sm:text-base">Aquí ves cómo va todo: el avance, las visitas de supervisión, los documentos que vamos entregando y lo último que ha pasado.</p>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-line bg-surface p-6 text-center sm:p-10">
          <p className="text-mute">Aún no hay proyectos ligados a tu cuenta. Cuando el equipo empiece uno contigo, aparecerá aquí.</p>
          {quotes.length === 0 && <Link href="/cotizar" className="btn mt-6">Solicitar cotización</Link>}
        </div>
      ) : (
        <div className="space-y-8">
          {rows.map(({ p, docs, visits, events, open, closed }) => {
            const delivered = p.status === "entregado";
            const done = visits.filter((v) => v.status === "realizada").length;
            const next = [...visits].reverse().find((v) => v.status === "programada");
            const last = events[0]?.createdAt ?? p.updatedAt;
            return (
              <article key={p.id} id={`proyecto-${p.id}`} className="scroll-mt-28 rounded-3xl border border-line bg-surface p-4 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-mute">{projectCode(p.id, p.createdAt)}</p>
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{p.name}</h2>
                    <p className="mt-1 text-sm text-mute">{p.spaceType} · Última actualización: {fmtDateTime(last)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-baseline justify-between">
                    <h3 className="font-semibold">Avance del proyecto</h3>
                    <span className="text-xs text-mute">{delivered ? "Proyecto entregado" : p.progress === 0 ? "Aún no empieza el trabajo" : "Lo actualiza el equipo"}</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>

                <div className="mt-7"><StageStepper stage={p.stage} delivered={delivered} /></div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <Dato label="Etapa actual">{delivered ? "Entrega" : p.stage}</Dato>
                  <Dato label="Inicio">{fmtDate(isoDay(p.createdAt))}</Dato>
                  <Dato label="Entrega" sub={plazo(p.dueDate, delivered)}>{fmtDate(p.dueDate)}</Dato>
                </div>

                <h3 className="mb-3 mt-8 font-semibold">Supervisión en obra</h3>
                {visits.length === 0 ? <p className="text-sm text-mute">Todavía no hay visitas programadas.</p> : (
                  <>
                    <p className="text-sm text-mute">
                      {done} de {visits.length} {visits.length === 1 ? "visita realizada" : "visitas realizadas"}
                      {next ? ` · Próxima: ${fmtDate(next.visitDate)}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-mute">
                      Observaciones: <span className="font-semibold text-ink">{open}</span> por resolver · <span className="font-semibold text-ink">{closed}</span> resueltas
                    </p>
                    <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
                      {visits.map((v) => (
                        <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                          <span>{fmtDate(v.visitDate)}</span>
                          <Badge tone={v.status === "realizada" ? "g" : "b"}>{v.status === "realizada" ? "Realizada" : "Programada"}</Badge>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h3 className="mb-3 mt-8 font-semibold">Documentos</h3>
                {docs.length === 0 ? <p className="text-sm text-mute">Todavía no hay documentos en PDF. Cuando el equipo suba uno, lo verás aquí.</p> : (
                  <ul className="divide-y divide-line rounded-2xl border border-line">
                    {docs.map((d) => {
                      const [label, tone] = DOC_STATUS[d.status];
                      return (
                        <li key={d.id} className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{d.title}</p>
                              <p className="text-sm text-mute">{DOC_KIND[d.kind] ?? d.kind} · versión {d.version} · {fmtDate(isoDay(d.createdAt))}{d.fileSize ? ` · ${fmtMB(d.fileSize)}` : ""}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge tone={tone}>{label}</Badge>
                              <a href={`/api/documentos/${d.id}`} target="_blank" className="btn-ghost px-3 py-1.5 text-xs">Ver PDF</a>
                            </div>
                          </div>
                          <div className="mt-2.5 flex flex-wrap items-center gap-3">
                            {d.clientStatus === "aprobado" && <Badge tone="g">Aprobaste este documento</Badge>}
                            {d.clientStatus === "cambios" && <Badge tone="a">Pediste cambios</Badge>}
                            {d.clientStatus !== "aprobado" && (
                              <>
                                <ActionButton action={reviewDocument} fields={{ id: d.id, decision: "aprobado" }} confirm={`¿Aprobar «${d.title}»?`} okText="Documento aprobado" className="btn px-3 py-1.5 text-xs">Aprobar</ActionButton>
                                <EditDialog label="Pedir cambios" title={`Pedir cambios en «${d.title}»`} className="text-xs font-semibold text-accent hover:underline">
                                  <ActionForm action={reviewDocumentForm} submit="Enviar" success="Pedido enviado al equipo">
                                    <input type="hidden" name="id" value={d.id} /><input type="hidden" name="decision" value="cambios" />
                                    <label className="label" htmlFor={`c-${d.id}`}>¿Qué hay que cambiar?</label>
                                    <textarea id={`c-${d.id}`} name="comment" className="input" maxLength={500} required minLength={3} placeholder="Cuéntanos qué te gustaría ajustar…" />
                                  </ActionForm>
                                </EditDialog>
                              </>
                            )}
                            {d.clientComment && d.clientStatus === "cambios" && <span className="text-xs text-mute">«{d.clientComment}»</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <h3 className="mb-3 mt-8 font-semibold">Lo último</h3>
                {events.length === 0 ? <p className="text-sm text-mute">Cuando haya novedades, aparecerán aquí.</p> : (
                  <ol className="relative space-y-4 border-l border-line pl-6">
                    {events.map((e) => (
                      <li key={e.id} className="relative">
                        <span aria-hidden className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-surface" />
                        <p className="text-sm font-medium">{e.message}</p>
                        <p className="text-xs text-mute">{fmtDateTime(e.createdAt)}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            );
          })}
        </div>
      )}

      {quotes.length > 0 && (
        <section className="mt-12" aria-labelledby="cotizaciones">
          <h2 id="cotizaciones" className="mb-3 text-xl font-semibold sm:text-2xl tracking-tight">Mis cotizaciones</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {quotes.map((q) => {
              const [label, tone] = QUOTE_STATUS[q.status];
              return (
                <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{q.details ? `${q.details.space} · ${q.details.services.join(", ")}` : q.message.split("\n")[0]}</p>
                    <p className="text-sm text-mute">{fmtDateTime(q.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={tone}>{label}</Badge>
                    {q.projectId && rows.some((r) => r.p.id === q.projectId) && <a href={`#proyecto-${q.projectId}`} className="text-sm font-semibold text-accent hover:underline">Ver mi proyecto</a>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
