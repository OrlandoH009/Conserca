"use client";

import { useState } from "react";
import { coolingLoad, DEFAULT_ACH, num, ventFlow, VENT_LABEL, type Orientation, type VentKind } from "@/lib/calc";

function Field({ label, value, set, step = "any" }: { label: string; value: string; set: (v: string) => void; step?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type="number" step={step} value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );
}

function Result({ children, error }: { children?: React.ReactNode; error?: string }) {
  return (
    <div className="mt-5 rounded-xl bg-soft p-4" aria-live="polite">
      {error ? <p className="text-sm text-red-700">{error}</p> : children}
      <p className="mt-2 text-xs text-mute">Estimado con fórmulas simplificadas. Validar por ingeniería.</p>
    </div>
  );
}

function Carga() {
  const [v, setV] = useState({ areaM2: "120", heightM: "3", people: "14", equipmentW: "2000", lightingWm2: "12" });
  const [o, setO] = useState<Orientation>("oeste");
  const set = (k: keyof typeof v) => (x: string) => setV((p) => ({ ...p, [k]: x }));
  let out: ReturnType<typeof coolingLoad> | null = null, error = "";
  try {
    out = coolingLoad({ areaM2: Number(v.areaM2), heightM: Number(v.heightM), people: Number(v.people), equipmentW: Number(v.equipmentW), lightingWm2: Number(v.lightingWm2), orientation: o });
  } catch (e) { error = e instanceof Error ? e.message : "Revisa los datos"; }
  return (
    <section className="card">
      <h2 className="mb-4 font-bold">Carga térmica rápida</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Área (m²)" value={v.areaM2} set={set("areaM2")} />
        <Field label="Altura (m)" value={v.heightM} set={set("heightM")} />
        <Field label="Personas" value={v.people} set={set("people")} step="1" />
        <div>
          <label className="label">Orientación</label>
          <select className="input" value={o} onChange={(e) => setO(e.target.value as Orientation)}>
            {["norte", "sur", "este", "oeste"].map((x) => <option key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</option>)}
          </select>
        </div>
        <Field label="Equipos (W)" value={v.equipmentW} set={set("equipmentW")} />
        <Field label="Iluminación (W/m²)" value={v.lightingWm2} set={set("lightingWm2")} />
      </div>
      <Result error={error}>
        {out && (
          <>
            <p className="text-sm text-mute">Carga térmica estimada</p>
            <p className="text-4xl font-bold tracking-tight text-accent">{out.tr} TR</p>
            <p className="text-sm text-mute">≈ {out.kw} kW</p>
            <p className="mt-2 text-xs text-mute">Ocupantes {out.shares.ocupantes}% · Equipos e iluminación {out.shares.equipos}% · Envolvente {out.shares.envolvente}% · Aire exterior {out.shares.ventilacion}%</p>
          </>
        )}
      </Result>
    </section>
  );
}

function Ventilacion() {
  const [kind, setKind] = useState<VentKind>("sanitarios");
  const [v, setV] = useState({ areaM2: "60", heightM: "2.7", ach: String(DEFAULT_ACH.sanitarios), doors: "2" });
  const set = (k: keyof typeof v) => (x: string) => setV((p) => ({ ...p, [k]: x }));
  const pick = (k: VentKind) => { setKind(k); if (k !== "escalera") setV((p) => ({ ...p, ach: String(DEFAULT_ACH[k]) })); };
  let flow: number | null = null, error = "";
  try { flow = ventFlow({ kind, areaM2: Number(v.areaM2), heightM: Number(v.heightM), ach: Number(v.ach), doors: Number(v.doors) }); }
  catch (e) { error = e instanceof Error ? e.message : "Revisa los datos"; }
  return (
    <section className="card">
      <h2 className="mb-4 font-bold">Ventilación mecánica rápida</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Tipo de espacio</label>
          <select className="input" value={kind} onChange={(e) => pick(e.target.value as VentKind)}>
            {(Object.keys(VENT_LABEL) as VentKind[]).map((k) => <option key={k} value={k}>{VENT_LABEL[k]}</option>)}
          </select>
        </div>
        {kind === "escalera" ? <Field label="Puertas" value={v.doors} set={set("doors")} step="1" /> : (
          <>
            <Field label="Área (m²)" value={v.areaM2} set={set("areaM2")} />
            <Field label="Altura (m)" value={v.heightM} set={set("heightM")} />
            <Field label="Cambios por hora" value={v.ach} set={set("ach")} />
          </>
        )}
      </div>
      <Result error={error}>
        {flow !== null && (<><p className="text-sm text-mute">Caudal estimado</p><p className="text-4xl font-bold tracking-tight text-accent">{num(flow)} m³/h</p></>)}
      </Result>
    </section>
  );
}

export function Calculators() {
  return <div className="grid gap-5 xl:grid-cols-2"><Carga /><Ventilacion /></div>;
}
