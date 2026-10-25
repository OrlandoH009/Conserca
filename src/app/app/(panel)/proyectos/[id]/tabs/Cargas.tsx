import * as CalcController from "@/controllers/calc.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Empty, Estimado } from "@/components/app/ui";
import { num } from "@/lib/calc";
import { addSpace, removeRow } from "../../actions";

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
                      <form action={removeRow}>
                        <input type="hidden" name="table" value="spaces" /><input type="hidden" name="id" value={r.id} /><input type="hidden" name="projectId" value={projectId} />
                        <button className="text-xs text-red-700 hover:underline">Quitar</button>
                      </form>
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
          <ActionForm action={addSpace} submit="Calcular y guardar">
            <input type="hidden" name="projectId" value={projectId} />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><F label="Nombre del espacio" name="name" placeholder="Oficina abierta, nivel 3" /></div>
              <F label="Uso" name="usage" placeholder="Oficinas" />
              <F label="Orientación" name="orientation">
                <select id="orientation" name="orientation" className="input" defaultValue="" required>
                  <option value="" disabled>Elegir…</option>
                  {["norte", "sur", "este", "oeste"].map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
                </select>
              </F>
              <F label="Área (m²)" name="areaM2" type="number" step="any" />
              <F label="Altura (m)" name="heightM" type="number" step="any" defaultValue={3} />
              <F label="Personas" name="people" type="number" step="1" />
              <F label="Equipos (W)" name="equipmentW" type="number" step="any" defaultValue={0} />
              <div className="col-span-2"><F label="Iluminación (W/m²)" name="lightingWm2" type="number" step="any" defaultValue={12} /></div>
            </div>
          </ActionForm>
        </section>
      )}
    </div>
  );
}
