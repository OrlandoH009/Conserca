import * as CalcController from "@/controllers/calc.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { RowActions } from "@/components/app/RowActions";
import { Empty } from "@/components/app/ui";
import { num } from "@/lib/calc";
import { addAirElement, removeRow, updateAirElement } from "../../actions";

function AirFields({ e }: { e?: { name: string; kind: string; flowM3h: number; size: string } }) {
  return (
    <div className="space-y-3">
      <F label="Nombre" name="name" placeholder="Difusor D4" defaultValue={e?.name} />
      <F label="Tipo" name="kind" placeholder="Difusor, Rectangular, Retorno…" defaultValue={e?.kind} />
      <F label="Caudal (m³/h)" name="flowM3h" type="number" step="any" defaultValue={e?.flowM3h} />
      <F label="Medida" name="size" placeholder="300 × 300 mm" defaultValue={e?.size} />
    </div>
  );
}

export async function Distribucion({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const rows = await CalcController.airElementsOf(projectId);
  return (
    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-bold">Conductos, rejillas y difusores</h2>
        {rows.length === 0 ? <Empty>Aún no hay elementos de distribución.</Empty> : (
          <table className="tbl">
            <thead><tr><th>Elemento</th><th>Tipo</th><th>Caudal (m³/h)</th><th>Medida</th>{canEdit && <th />}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.name}</td><td>{r.kind}</td><td>{num(r.flowM3h)}</td><td>{r.size}</td>
                  {canEdit && (
                    <td>
                      <RowActions
                        title={`Editar «${r.name}»`}
                        onRemove={removeRow}
                        removeFields={{ table: "airElements", id: r.id, projectId }}
                        edit={(
                          <ActionForm action={updateAirElement} submit="Guardar cambios" success="Elemento actualizado">
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
          <h2 className="mb-3 font-bold">Agregar elemento</h2>
          <ActionForm action={addAirElement} success="Elemento agregado">
            <input type="hidden" name="projectId" value={projectId} />
            <AirFields />
          </ActionForm>
        </section>
      )}
    </div>
  );
}
