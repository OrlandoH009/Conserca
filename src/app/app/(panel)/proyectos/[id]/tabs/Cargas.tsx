import { getT } from "@/lib/i18n-server";
import * as CalcController from "@/controllers/calc.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { RowActions } from "@/components/app/RowActions";
import { Empty, Estimado } from "@/components/app/ui";
import { num } from "@/lib/calc";
import { addSpace, removeRow, updateSpace } from "../../actions";

const ORIENTATIONS = ["norte", "sur", "este", "oeste"];

/** Campos del espacio: sirven para agregar (vacíos) y para editar (con los valores actuales). */
async function SpaceFields({ s }: { s?: { name: string; usage: string; orientation: string; areaM2: number; heightM: number; people: number; equipmentW: number; lightingWm2: number } }) {
  const t = await getT();
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><F label={t("Nombre del espacio")} name="name" placeholder={t("Oficina abierta, nivel 3")} defaultValue={s?.name} /></div>
      <F label={t("Uso")} name="usage" placeholder={t("Oficinas")} defaultValue={s?.usage} />
      <F label={t("Orientación")} name="orientation">
        <select key={s?.orientation} id="orientation" name="orientation" className="input" defaultValue={s?.orientation ?? ""} required>
          <option value="" disabled>{t("Elegir…")}</option>
          {ORIENTATIONS.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
        </select>
      </F>
      <F label={t("Área (m²)")} name="areaM2" type="number" step="any" defaultValue={s?.areaM2} />
      <F label={t("Altura (m)")} name="heightM" type="number" step="any" defaultValue={s?.heightM ?? 3} />
      <F label={t("Personas")} name="people" type="number" step="1" defaultValue={s?.people} />
      <F label={t("Equipos (W)")} name="equipmentW" type="number" step="any" defaultValue={s?.equipmentW ?? 0} />
      <div className="col-span-2"><F label={t("Iluminación (W/m²)")} name="lightingWm2" type="number" step="any" defaultValue={s?.lightingWm2 ?? 12} /></div>
    </div>
  );
}

export async function Cargas({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const t = await getT();
  const { rows, kw, tr } = await CalcController.spacesOf(projectId);
  return (
    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-bold">{t("Espacios del proyecto")}</h2>
        {rows.length === 0 ? <Empty>{t("Aún no hay espacios. Agrega el primero para calcular su carga térmica.")}</Empty> : (
          <table className="tbl">
            <thead><tr><th>{t("Espacio")}</th><th>{t("Área (m²)")}</th><th>{t("Personas")}</th><th>{t("Orientación")}</th><th>{t("Carga (kW)")}</th><th>{t("Carga (TR)")}</th>{canEdit && <th />}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.name}<div className="text-xs font-normal text-mute">{r.usage}</div></td>
                  <td>{num(r.areaM2)}</td><td>{r.people}</td><td className="capitalize">{r.orientation}</td><td>{r.loadKw}</td><td className="font-semibold text-accent">{r.loadTr}</td>
                  {canEdit && (
                    <td>
                      <RowActions
                        title={t("Editar «{name}»", { name: r.name })}
                        onRemove={removeRow}
                        removeFields={{ table: "spaces", id: r.id, projectId }}
                        edit={(
                          <ActionForm action={updateSpace} submit={t("Recalcular y guardar")} success={t("Espacio actualizado")}>
                            <input type="hidden" name="id" value={r.id} /><input type="hidden" name="projectId" value={projectId} />
                            <SpaceFields s={r} />
                          </ActionForm>
                        )}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td colSpan={4} className="px-3 py-3 font-bold">{t("Total")}</td><td className="px-3 py-3 font-bold">{kw}</td><td className="px-3 py-3 font-bold text-accent">{tr}</td>{canEdit && <td />}</tr></tfoot>
          </table>
        )}
        <Estimado />
      </section>

      {canEdit && (
        <section className="card">
          <h2 className="mb-3 font-bold">{t("Agregar espacio")}</h2>
          <ActionForm action={addSpace} submit={t("Calcular y guardar")} success={t("Espacio calculado y guardado")}>
            <input type="hidden" name="projectId" value={projectId} />
            <SpaceFields />
          </ActionForm>
        </section>
      )}
    </div>
  );
}
