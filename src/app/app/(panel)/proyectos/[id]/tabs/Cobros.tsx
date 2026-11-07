import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import * as PaymentController from "@/controllers/payment.controller";
import { ActionButton } from "@/components/app/ActionButton";
import { ActionForm, F } from "@/components/app/ActionForm";
import { EditDialog } from "@/components/app/EditDialog";
import { RowActions } from "@/components/app/RowActions";
import { Badge, Empty } from "@/components/app/ui";
import { money } from "@/lib/calc";
import { CONFIG } from "@/lib/config";
import { fmtDate, todayISO } from "@/lib/format";
import { isDue, nearYearEnd, PLAN } from "@/lib/payments";
import { createPaymentPlan, invoicePayment, removeRow, setPaymentStatus, updatePayment } from "../../actions";

const STATUS = { pendiente: ["Pendiente", "n"], facturado: ["Facturado", "b"], cobrado: ["Cobrado", "g"] } as const;

async function PaymentFields({ p }: { p: { label: string; amount: number; dueProgress: number; status: keyof typeof STATUS; invoiceNo: string | null } }) {
  const t = await getT();
  return (
    <div className="space-y-3">
      <F label={t("Concepto")} name="label" defaultValue={p.label} />
      <div className="grid grid-cols-2 gap-3">
        <F label={t("Monto ({currency})", { currency: CONFIG.currency })} name="amount" type="number" step="any" defaultValue={p.amount} />
        <F label={t("Se factura al llegar a (% de avance)")} name="dueProgress" type="number" defaultValue={p.dueProgress} />
      </div>
      <F label={t("Estado")} name="status">
        <select id="status" name="status" className="input" defaultValue={p.status}>
          {Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{t(l)}</option>)}
        </select>
      </F>
      <F label={t("N.º de factura")} name="invoiceNo" required={false} defaultValue={p.invoiceNo ?? ""} />
    </div>
  );
}

export async function Cobros({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const t = await getT();
  const { rows, project, client } = await PaymentController.planOf(projectId);
  if (!project) return null;

  const total = rows.reduce((n, r) => n + r.amount, 0);
  const sum = (s: keyof typeof STATUS) => rows.filter((r) => r.status === s).reduce((n, r) => n + r.amount, 0);
  const invoiced = sum("facturado") + sum("cobrado");
  const due = rows.filter((r) => isDue(r, project));
  const pending = rows.filter((r) => r.status === "pendiente");
  const yearEnd = nearYearEnd(todayISO()) && pending.length > 0;
  const missing = client ? [!client.taxId && t("NIT / NRC"), !client.billingEmail && t("Correo para enviar la factura"), !client.authorizer && t("Quién autoriza que se facture")].filter(Boolean) : [];

  const tiles: [string, number][] = [[t("Total del contrato"), total], [t("Facturado"), invoiced], [t("Cobrado"), sum("cobrado")], [t("Falta facturar"), sum("pendiente")]];

  return (
    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
      <div className="space-y-5">
        {due.length > 0 && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            <b>{t("Toca facturar:")}</b> {due.map((r) => `${t(r.label)} (${money(r.amount)})`).join(", ")}. {t("El proyecto ya llegó al avance de este cobro.")}
          </p>
        )}
        {yearEnd && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t("Se acerca el cierre de año: lo que no se facture a tiempo puede quedar fuera de este año. Quedan {n} cobros por facturar.", { n: pending.length })}
          </p>
        )}

        {rows.length > 0 && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {tiles.map(([l, v]) => (
              <div key={l} className="card"><p className="text-sm text-mute">{l}</p><p className="mt-1 text-xl font-bold tabular-nums">{money(v)}</p></div>
            ))}
          </div>
        )}

        <section className="card">
          <h2 className="font-bold">{t("Plan de cobros")}</h2>
          <p className="mb-3 text-sm text-mute">{t("Avance actual del proyecto: {n} %. Cada cobro avisa cuando el proyecto llega a su avance.", { n: project.progress })}</p>
          {rows.length === 0 ? (
            <Empty>{t("Aún no hay plan de cobros.")}</Empty>
          ) : rows.map((r) => {
            const [label, tone] = STATUS[r.status];
            const late = isDue(r, project);
            return (
              <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
                <div className="min-w-0">
                  <p className="font-semibold">{t(r.label)} <Badge tone={late ? "r" : tone}>{late ? t("Toca facturar") : t(label)}</Badge></p>
                  <p className="text-sm text-mute">
                    {money(r.amount)}{total > 0 && ` · ${Math.round((r.amount / total) * 100)} %`} · {r.dueProgress === 0 ? t("Se factura al iniciar") : t("Se factura al {n} % de avance", { n: r.dueProgress })}
                  </p>
                  {r.invoicedAt && <p className="text-xs text-mute">{t("Factura")} {r.invoiceNo ?? t("sin número")} · {fmtDate(r.invoicedAt)}{r.paidAt && ` · ${t("Cobrado el")} ${fmtDate(r.paidAt)}`}</p>}
                </div>
                {canEdit && (
                  <div className="flex flex-wrap items-center gap-3">
                    {r.status === "pendiente" && (
                      <EditDialog label={t("Marcar como facturado")} title={t("Facturar «{name}»", { name: t(r.label) })} className={late ? "btn px-3 py-1.5 text-xs" : "btn-ghost px-3 py-1.5 text-xs"}>
                        <ActionForm action={invoicePayment} submit={t("Marcar como facturado")} success={t("Cobro marcado como facturado")}>
                          <input type="hidden" name="id" value={r.id} /><input type="hidden" name="projectId" value={projectId} /><input type="hidden" name="status" value="facturado" />
                          <F label={t("N.º de factura")} name="invoiceNo" required={false} defaultValue={r.invoiceNo ?? ""} />
                        </ActionForm>
                      </EditDialog>
                    )}
                    {r.status === "facturado" && (
                      <ActionButton action={setPaymentStatus} fields={{ id: r.id, projectId, status: "cobrado" }} okText={t("Cobro marcado como cobrado")} className="btn px-3 py-1.5 text-xs">{t("Marcar como cobrado")}</ActionButton>
                    )}
                    <RowActions
                      title={t("Editar «{name}»", { name: t(r.label) })}
                      onRemove={removeRow}
                      removeFields={{ table: "payments", id: r.id, projectId }}
                      confirm={t("¿Quitar este cobro del plan?")}
                      edit={(
                        <ActionForm action={updatePayment} submit={t("Guardar cambios")} success={t("Cobro actualizado")}>
                          <input type="hidden" name="id" value={r.id} /><input type="hidden" name="projectId" value={projectId} />
                          <PaymentFields p={r} />
                        </ActionForm>
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>

      <div className="space-y-5 self-start">
        {rows.length === 0 && canEdit && (
          <section className="card">
            <h2 className="mb-1 font-bold">{t("Crear plan de cobros")}</h2>
            <p className="mb-3 text-sm text-mute">{t("Escribe el monto del contrato y se reparte en {plan}. Después puedes ajustar cada cobro.", { plan: PLAN.map(([l, pct]) => `${t(l)} ${pct} %`).join(", ") })}</p>
            <ActionForm action={createPaymentPlan} submit={t("Crear plan")} success={t("Plan de cobros creado")}>
              <input type="hidden" name="projectId" value={projectId} />
              <F label={t("Monto del contrato ({currency})", { currency: CONFIG.currency })} name="total" type="number" step="any" />
            </ActionForm>
          </section>
        )}

        <section className="card">
          <h2 className="mb-3 font-bold">{t("Datos para facturar")}</h2>
          {!client ? (
            <p className="text-sm text-mute">{t("Este proyecto no tiene cliente. Elige uno en «Editar datos».")}</p>
          ) : (
            <>
              <dl className="space-y-1.5 text-sm">
                {([[t("Cliente"), client.name], [t("NIT / NRC"), client.taxId], [t("Correo para enviar la factura"), client.billingEmail], [t("Quién autoriza que se facture"), client.authorizer]] as const).map(([k, v]) => (
                  <div key={k}><dt className="text-mute">{k}</dt><dd className="font-medium">{v ?? "—"}</dd></div>
                ))}
              </dl>
              {missing.length > 0 && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {t("Faltan datos para facturar:")} {missing.join(", ")}. <Link href="/app/clientes" className="font-semibold underline">{t("Completar en Clientes")}</Link>
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
