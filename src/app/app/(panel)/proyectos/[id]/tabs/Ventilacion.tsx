import * as CalcController from "@/controllers/calc.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Empty, Estimado } from "@/components/app/ui";
import { DEFAULT_ACH, num, VENT_LABEL, type VentKind } from "@/lib/calc";
import { addVentZone, removeRow } from "../../actions";

export async function Ventilacion({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const rows = await CalcController.ventZonesOf(projectId);
  const kinds = Object.keys(VENT_LABEL) as VentKind[];
  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kinds.map((k) => {
          const z = rows.filter((r) => r.kind === k);
          return (
            <div key={k} className="card">
              <p className="text-sm text-mute">{z.length} {z.length === 1 ? "zona" : "zonas"}</p>
              <h3 className="font-bold">{VENT_LABEL[k]}</h3>
              <p className="mt-1 text-2xl font-bold tracking-tight text-accent">{num(z.reduce((s, r) => s + r.flowM3h, 0))} <span className="text-sm font-medium text-mute">m³/h</span></p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="card overflow-x-auto">
          <h2 className="mb-3 font-bold">Caudales por zona</h2>
          {rows.length === 0 ? <Empty>Aún no hay zonas de ventilación.</Empty> : (
            <table className="tbl">
              <thead><tr><th>Zona</th><th>Tipo</th><th>Área (m²)</th><th>Cambios/h</th><th>Puertas</th><th>Caudal (m³/h)</th>{canEdit && <th />}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.name}</td><td>{VENT_LABEL[r.kind]}</td><td>{r.areaM2 ?? "—"}</td><td>{r.ach ?? "—"}</td><td>{r.doors ?? "—"}</td><td className="font-semibold text-accent">{num(r.flowM3h)}</td>
                    {canEdit && (
                      <td>
                        <form action={removeRow}>
                          <input type="hidden" name="table" value="ventZones" /><input type="hidden" name="id" value={r.id} /><input type="hidden" name="projectId" value={projectId} />
                          <button className="text-xs text-red-700 hover:underline">Quitar</button>
                        </form>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Estimado />
        </section>
        {canEdit && (
          <section className="card">
            <h2 className="mb-3 font-bold">Agregar zona</h2>
            <ActionForm action={addVentZone} submit="Calcular y guardar">
              <input type="hidden" name="projectId" value={projectId} />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><F label="Nombre" name="name" placeholder="Sótano 3" /></div>
                <div className="col-span-2">
                  <F label="Tipo de espacio" name="kind">
                    <select id="kind" name="kind" className="input" defaultValue="" required>
                      <option value="" disabled>Elegir…</option>
                      {kinds.map((k) => <option key={k} value={k}>{VENT_LABEL[k]}</option>)}
                    </select>
                  </F>
                </div>
                <F label="Área (m²)" name="areaM2" type="number" step="any" required={false} />
                <F label="Altura (m)" name="heightM" type="number" step="any" required={false} />
                <F label="Cambios por hora" name="ach" type="number" step="any" required={false} />
                <F label="Puertas (escalera)" name="doors" type="number" step="1" required={false} />
              </div>
              <p className="mt-3 text-xs text-mute">
                Escalera presurizada: llena solo las puertas. Los demás: área, altura y cambios por hora
                (sugeridos: estacionamiento {DEFAULT_ACH.estacionamiento}, sanitarios {DEFAULT_ACH.sanitarios}, bodega {DEFAULT_ACH.bodega}).
              </p>
            </ActionForm>
          </section>
        )}
      </div>
    </>
  );
}
