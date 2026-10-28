import * as CalcController from "@/controllers/calc.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { RowActions } from "@/components/app/RowActions";
import { Empty, Estimado } from "@/components/app/ui";
import { DEFAULT_ACH, num, VENT_LABEL, type VentKind } from "@/lib/calc";
import { addVentZone, removeRow, updateVentZone } from "../../actions";

const KINDS = Object.keys(VENT_LABEL) as VentKind[];

function ZoneFields({ z }: { z?: { name: string; kind: string; areaM2: number | null; heightM: number | null; ach: number | null; doors: number | null } }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><F label="Nombre" name="name" placeholder="Sótano 3" defaultValue={z?.name} /></div>
        <div className="col-span-2">
          <F label="Tipo de espacio" name="kind">
            <select key={z?.kind} id="kind" name="kind" className="input" defaultValue={z?.kind ?? ""} required>
              <option value="" disabled>Elegir…</option>
              {KINDS.map((k) => <option key={k} value={k}>{VENT_LABEL[k]}</option>)}
            </select>
          </F>
        </div>
        <F label="Área (m²)" name="areaM2" type="number" step="any" required={false} defaultValue={z?.areaM2 ?? undefined} />
        <F label="Altura (m)" name="heightM" type="number" step="any" required={false} defaultValue={z?.heightM ?? undefined} />
        <F label="Cambios por hora" name="ach" type="number" step="any" required={false} defaultValue={z?.ach ?? undefined} />
        <F label="Puertas (escalera)" name="doors" type="number" step="1" required={false} defaultValue={z?.doors ?? undefined} />
      </div>
      <p className="mt-3 text-xs text-mute">
        Escalera presurizada: llena solo las puertas. Los demás: área, altura y cambios por hora
        (sugeridos: estacionamiento {DEFAULT_ACH.estacionamiento}, sanitarios {DEFAULT_ACH.sanitarios}, bodega {DEFAULT_ACH.bodega}).
      </p>
    </>
  );
}

export async function Ventilacion({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const rows = await CalcController.ventZonesOf(projectId);
  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KINDS.map((k) => {
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
                        <RowActions
                          title={`Editar «${r.name}»`}
                          onRemove={removeRow}
                          removeFields={{ table: "ventZones", id: r.id, projectId }}
                          edit={(
                            <ActionForm action={updateVentZone} submit="Recalcular y guardar" success="Zona actualizada">
                              <input type="hidden" name="id" value={r.id} /><input type="hidden" name="projectId" value={projectId} />
                              <ZoneFields z={r} />
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
          <Estimado />
        </section>
        {canEdit && (
          <section className="card">
            <h2 className="mb-3 font-bold">Agregar zona</h2>
            <ActionForm action={addVentZone} submit="Calcular y guardar" success="Zona calculada y guardada">
              <input type="hidden" name="projectId" value={projectId} />
              <ZoneFields />
            </ActionForm>
          </section>
        )}
      </div>
    </>
  );
}
