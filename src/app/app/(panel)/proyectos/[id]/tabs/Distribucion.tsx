import * as CalcController from "@/controllers/calc.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Empty } from "@/components/app/ui";
import { num } from "@/lib/calc";
import { addAirElement, removeRow } from "../../actions";

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
                      <form action={removeRow}>
                        <input type="hidden" name="table" value="airElements" /><input type="hidden" name="id" value={r.id} /><input type="hidden" name="projectId" value={projectId} />
                        <button className="text-xs text-red-700 hover:underline">Quitar</button>
                      </form>
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
          <ActionForm action={addAirElement}>
            <input type="hidden" name="projectId" value={projectId} />
            <div className="space-y-3">
              <F label="Nombre" name="name" placeholder="Difusor D4" />
              <F label="Tipo" name="kind" placeholder="Difusor, Rectangular, Retorno…" />
              <F label="Caudal (m³/h)" name="flowM3h" type="number" step="any" />
              <F label="Medida" name="size" placeholder="300 × 300 mm" />
            </div>
          </ActionForm>
        </section>
      )}
    </div>
  );
}
