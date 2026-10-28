import * as CalcController from "@/controllers/calc.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { RowActions } from "@/components/app/RowActions";
import { Empty, Estimado } from "@/components/app/ui";
import { num } from "@/lib/calc";
import { addSpace, removeRow, updateSpace } from "../../actions";

const ORIENTATIONS = ["norte", "sur", "este", "oeste"];

/** Campos del espacio: sirven para agregar (vacíos) y para editar (con los valores actuales). */
function SpaceFields({ s }: { s?: { name: string; usage: string; orientation: string; areaM2: number; heightM: number; people: number; equipmentW: number; lightingWm2: number } }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><F label="Nombre del espacio" name="name" placeholder="Oficina abierta, nivel 3" defaultValue={s?.name} /></div>
      <F label="Uso" name="usage" placeholder="Oficinas" defaultValue={s?.usage} />
      <F label="Orientación" name="orientation">
        <select key={s?.orientation} id="orientation" name="orientation" className="input" defaultValue={s?.orientation ?? ""} required>
          <option value="" disabled>Elegir…</option>
          {ORIENTATIONS.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
        </select>
      </F>
      <F label="Área (m²)" name="areaM2" type="number" step="any" defaultValue={s?.areaM2} />
      <F label="Altura (m)" name="heightM" type="number" step="any" defaultValue={s?.heightM ?? 3} />
      <F label="Personas" name="people" type="number" step="1" defaultValue={s?.people} />
      <F label="Equipos (W)" name="equipmentW" type="number" step="any" defaultValue={s?.equipmentW ?? 0} />
      <div className="col-span-2"><F label="Iluminación (W/m²)" name="lightingWm2" type="number" step="any" defaultValue={s?.lightingWm2 ?? 12} /></div>
    </div>
  );
}

export async function Cargas({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const { rows, kw, tr } = await CalcController.spacesOf(projectId);
  return (
    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-bold">Espacios del proyecto</h2>
        {rows.length === 0 ? <Empty>Aún no hay espacios. Agrega el primero para calcular su carga térmica.</Empty> : (
          <table className="tbl">
            <thead><tr><th>Espacio</th><th>Área (m²)</th><th>Personas</th><th>Orientación</th><th>Carga (kW)</th><th>Carga (TR)</th>{canEdit && <th />}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.name}<div className="text-xs font-normal text-mute">{r.usage}</div></td>
                  <td>{num(r.areaM2)}</td><td>{r.people}</td><td className="capitalize">{r.orientation}</td><td>{r.loadKw}</td><td className="font-semibold text-accent">{r.loadTr}</td>
                  {canEdit && (
                    <td>
                      <RowActions
                        title={`Editar «${r.name}»`}
                        onRemove={removeRow}
                        removeFields={{ table: "spaces", id: r.id, projectId }}
                        edit={(
                          <ActionForm action={updateSpace} submit="Recalcular y guardar" success="Espacio actualizado">
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
            <tfoot><tr><td colSpan={4} className="px-3 py-3 font-bold">Total</td><td className="px-3 py-3 font-bold">{kw}</td><td className="px-3 py-3 font-bold text-accent">{tr}</td>{canEdit && <td />}</tr></tfoot>
          </table>
        )}
        <Estimado />
      </section>

      {canEdit && (
        <section className="card">
          <h2 className="mb-3 font-bold">Agregar espacio</h2>
          <ActionForm action={addSpace} submit="Calcular y guardar" success="Espacio calculado y guardado">
            <input type="hidden" name="projectId" value={projectId} />
            <SpaceFields />
          </ActionForm>
        </section>
      )}
    </div>
  );
}
