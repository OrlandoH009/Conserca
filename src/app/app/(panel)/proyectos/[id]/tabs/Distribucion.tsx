import { getT } from "@/lib/i18n-server";
import * as CalcController from "@/controllers/calc.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { RowActions } from "@/components/app/RowActions";
import { Empty } from "@/components/app/ui";
import { num } from "@/lib/calc";
import { addAirElement, removeRow, updateAirElement } from "../../actions";

async function AirFields({ e }: { e?: { name: string; kind: string; flowM3h: number; size: string } }) {
  const t = await getT();
  return (
    <div className="space-y-3">
      <F label={t("Nombre")} name="name" placeholder={t("Difusor D4")} defaultValue={e?.name} />
      <F label={t("Tipo")} name="kind" placeholder={t("Difusor, Rectangular, Retorno…")} defaultValue={e?.kind} />
      <F label={t("Caudal (m³/h)")} name="flowM3h" type="number" step="any" defaultValue={e?.flowM3h} />
      <F label={t("Medida")} name="size" placeholder={t("300 × 300 mm")} defaultValue={e?.size} />
    </div>
  );
}

export async function Distribucion({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const t = await getT();
  const rows = await CalcController.airElementsOf(projectId);
  return (
    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-bold">{t("Conductos, rejillas y difusores")}</h2>
        {rows.length === 0 ? <Empty>{t("Aún no hay elementos de distribución.")}</Empty> : (
          <table className="tbl">
            <thead><tr><th>{t("Elemento")}</th><th>{t("Tipo")}</th><th>{t("Caudal (m³/h)")}</th><th>{t("Medida")}</th>{canEdit && <th />}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.name}</td><td>{r.kind}</td><td>{num(r.flowM3h)}</td><td>{r.size}</td>
                  {canEdit && (
                    <td>
                      <RowActions
                        title={t("Editar «{name}»", { name: r.name })}
                        onRemove={removeRow}
                        removeFields={{ table: "airElements", id: r.id, projectId }}
                        edit={(
                          <ActionForm action={updateAirElement} submit={t("Guardar cambios")} success={t("Elemento actualizado")}>
                            <input type="hidden" name="id" value={r.id} /><input type="hidden" name="projectId" value={projectId} />
                            <AirFields e={r} />
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
      {canEdit && (
        <section className="card">
          <h2 className="mb-3 font-bold">{t("Agregar elemento")}</h2>
          <ActionForm action={addAirElement} success={t("Elemento agregado")}>
            <input type="hidden" name="projectId" value={projectId} />
            <AirFields />
          </ActionForm>
        </section>
      )}
    </div>
  );
}
