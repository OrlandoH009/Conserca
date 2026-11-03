import { getT } from "@/lib/i18n-server";
import * as CalcController from "@/controllers/calc.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { RowActions } from "@/components/app/RowActions";
import { Empty, Estimado } from "@/components/app/ui";
import { DEFAULT_ACH, num, VENT_LABEL, type VentKind } from "@/lib/calc";
import { addVentZone, removeRow, updateVentZone } from "../../actions";

const KINDS = Object.keys(VENT_LABEL) as VentKind[];

async function ZoneFields({ z }: { z?: { name: string; kind: string; areaM2: number | null; heightM: number | null; ach: number | null; doors: number | null } }) {
  const t = await getT();
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><F label={t("Nombre")} name="name" placeholder={t("Sótano 3")} defaultValue={z?.name} /></div>
        <div className="col-span-2">
          <F label={t("Tipo de espacio")} name="kind">
            <select key={z?.kind} id="kind" name="kind" className="input" defaultValue={z?.kind ?? ""} required>
              <option value="" disabled>{t("Elegir…")}</option>
              {KINDS.map((k) => <option key={k} value={k}>{t(VENT_LABEL[k])}</option>)}
            </select>
          </F>
        </div>
        <F label={t("Área (m²)")} name="areaM2" type="number" step="any" required={false} defaultValue={z?.areaM2 ?? undefined} />
        <F label={t("Altura (m)")} name="heightM" type="number" step="any" required={false} defaultValue={z?.heightM ?? undefined} />
        <F label={t("Cambios por hora")} name="ach" type="number" step="any" required={false} defaultValue={z?.ach ?? undefined} />
        <F label={t("Puertas (escalera)")} name="doors" type="number" step="1" required={false} defaultValue={z?.doors ?? undefined} />
      </div>
      <p className="mt-3 text-xs text-mute">
        {t("Escalera presurizada: llena solo las puertas. Los demás: área, altura y cambios por hora (sugeridos: estacionamiento {park}, sanitarios {wc}, bodega {store}).", { park: DEFAULT_ACH.estacionamiento, wc: DEFAULT_ACH.sanitarios, store: DEFAULT_ACH.bodega })}
      </p>
    </>
  );
}

export async function Ventilacion({ projectId, canEdit }: { projectId: number; canEdit: boolean }) {
  const t = await getT();
  const rows = await CalcController.ventZonesOf(projectId);
  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KINDS.map((k) => {
          const z = rows.filter((r) => r.kind === k);
          return (
            <div key={k} className="card">
              <p className="text-sm text-mute">{z.length === 1 ? t("1 zona") : t("{n} zonas", { n: z.length })}</p>
              <h3 className="font-bold">{t(VENT_LABEL[k])}</h3>
              <p className="mt-1 text-2xl font-bold tracking-tight text-accent">{num(z.reduce((s, r) => s + r.flowM3h, 0))} <span className="text-sm font-medium text-mute">{t("m³/h")}</span></p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="card overflow-x-auto">
          <h2 className="mb-3 font-bold">{t("Caudales por zona")}</h2>
          {rows.length === 0 ? <Empty>{t("Aún no hay zonas de ventilación.")}</Empty> : (
            <table className="tbl">
              <thead><tr><th>{t("Zona")}</th><th>{t("Tipo")}</th><th>{t("Área (m²)")}</th><th>{t("Cambios/h")}</th><th>{t("Puertas")}</th><th>{t("Caudal (m³/h)")}</th>{canEdit && <th />}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.name}</td><td>{t(VENT_LABEL[r.kind])}</td><td>{r.areaM2 ?? "—"}</td><td>{r.ach ?? "—"}</td><td>{r.doors ?? "—"}</td><td className="font-semibold text-accent">{num(r.flowM3h)}</td>
                    {canEdit && (
                      <td>
                        <RowActions
                          title={t("Editar «{name}»", { name: r.name })}
                          onRemove={removeRow}
                          removeFields={{ table: "ventZones", id: r.id, projectId }}
                          edit={(
                            <ActionForm action={updateVentZone} submit={t("Recalcular y guardar")} success={t("Zona actualizada")}>
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
            <h2 className="mb-3 font-bold">{t("Agregar zona")}</h2>
            <ActionForm action={addVentZone} submit={t("Calcular y guardar")} success={t("Zona calculada y guardada")}>
              <input type="hidden" name="projectId" value={projectId} />
              <ZoneFields />
            </ActionForm>
          </section>
        )}
      </div>
    </>
  );
}
