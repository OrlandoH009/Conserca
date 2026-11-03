import { getT } from "@/lib/i18n-server";
import * as BudgetController from "@/controllers/budget.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { RowActions } from "@/components/app/RowActions";
import { Empty } from "@/components/app/ui";
import { IVA, money, num } from "@/lib/calc";
import { CONFIG } from "@/lib/config";
import { addBudgetItem, removeRow, updateBudgetItem } from "../../actions";

async function ItemFields({ i }: { i?: { description: string; unit: string; quantity: number; unitPrice: number } }) {
  const t = await getT();
  return (
    <div className="space-y-3">
      <F label={t("Partida")} name="description" placeholder={t("Conducto metálico")} defaultValue={i?.description} />
      <div className="grid grid-cols-2 gap-3">
        <F label={t("Unidad")} name="unit" placeholder={t("m², pza, lote")} defaultValue={i?.unit} />
        <F label={t("Cantidad")} name="quantity" type="number" step="any" defaultValue={i?.quantity} />
      </div>
      <F label={t("Precio unitario ({currency})", { currency: CONFIG.currency })} name="unitPrice" type="number" step="any" defaultValue={i?.unitPrice} />
    </div>
  );
}

export async function Presupuesto({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const t = await getT();
  const { rows, totals } = await BudgetController.budgetOf(projectId);
  return (
    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
      <div className="space-y-5">
        <section className="card overflow-x-auto">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">{t("Presupuesto estimado de obra")}</h2>
            {rows.length > 0 && <a href={`/api/proyectos/${projectId}/presupuesto`} download className="btn-ghost px-3 py-1.5 text-xs">{t("Descargar CSV")}</a>}
          </div>
          {rows.length === 0 ? <Empty>{t("Aún no hay partidas.")}</Empty> : (
            <table className="tbl">
              <thead><tr><th>{t("Partida")}</th><th>{t("Unidad")}</th><th>{t("Cantidad")}</th><th>{t("Precio unitario")}</th><th>{t("Importe")}</th>{canEdit && <th />}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.description}</td><td>{r.unit}</td><td>{num(r.quantity)}</td><td>{money(r.unitPrice)}</td><td className="font-semibold">{money(r.quantity * r.unitPrice)}</td>
                    {canEdit && (
                      <td>
                        <RowActions
                          title={t("Editar «{name}»", { name: r.description })}
                          onRemove={removeRow}
                          removeFields={{ table: "budgetItems", id: r.id, projectId }}
                          edit={(
                            <ActionForm action={updateBudgetItem} submit={t("Guardar cambios")} success={t("Partida actualizada")}>
                              <input type="hidden" name="id" value={r.id} /><input type="hidden" name="projectId" value={projectId} />
                              <ItemFields i={r} />
                            </ActionForm>
                          )}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section className="card max-w-sm">
          <div className="flex justify-between py-1.5"><span className="text-mute">{t("Subtotal")}</span><b>{money(totals.subtotal)}</b></div>
          <div className="flex justify-between py-1.5"><span className="text-mute">{t("IVA")} {Math.round(IVA * 100)} %</span><b>{money(totals.iva)}</b></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg"><b>{t("Total estimado")}</b><b className="text-accent">{money(totals.total)}</b></div>
          <p className="mt-3 text-xs text-mute">{t("Estimado de referencia. No incluye instalación: Conserca diseña y supervisa, no instala.")}</p>
        </section>
      </div>
      {canEdit && (
        <section className="card self-start">
          <h2 className="mb-3 font-bold">{t("Agregar partida")}</h2>
          <ActionForm action={addBudgetItem} success={t("Partida agregada")}>
            <input type="hidden" name="projectId" value={projectId} />
            <ItemFields />
          </ActionForm>
        </section>
      )}
    </div>
  );
}
