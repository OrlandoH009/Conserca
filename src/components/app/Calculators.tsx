"use client";

import { useState, useTransition } from "react";
import type { R } from "@/lib/action-utils";
import { coolingLoad, DEFAULT_ACH, kwToBtu, num, ventFlow, VENT_LABEL, type Orientation, type VentKind } from "@/lib/calc";
import { Spinner } from "./SubmitButton";
import { toast } from "./Toaster";

type Project = { id: number; name: string };

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

/** Guarda el cálculo actual como un espacio (o zona) de un proyecto, sin volver a escribir los datos. */
function SaveBox({ projects, fields, action, okText, withUsage }: { projects: Project[]; fields: Record<string, string>; action: (fd: FormData) => Promise<R>; okText: string; withUsage?: boolean }) {
  const [projectId, setProjectId] = useState(projects[0] ? String(projects[0].id) : "");
  const [name, setName] = useState("");
  const [usage, setUsage] = useState("");
  const [pending, start] = useTransition();
  if (projects.length === 0) return null;

  const save = () =>
    start(async () => {
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields)) fd.set(k, v);
      fd.set("projectId", projectId);
      fd.set("name", name);
      if (withUsage) fd.set("usage", usage);
      try {
        const r = await action(fd);
        if (r.error) toast.error(r.error); else { toast.ok(okText); setName(""); }
      } catch {
        toast.error("No se pudo guardar. Intenta de nuevo.");
      }
    });

  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="text-sm font-semibold">Guardar este cálculo en un proyecto</p>
      <div className={`mt-2 grid gap-2 ${withUsage ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} aria-label="Proyecto">
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" aria-label="Nombre" />
        {withUsage && <input className="input" value={usage} onChange={(e) => setUsage(e.target.value)} placeholder="Uso (Oficinas…)" aria-label="Uso" />}
      </div>
      <button type="button" onClick={save} disabled={pending || !name.trim() || (withUsage && !usage.trim())} className="btn-ghost mt-2.5">{pending && <Spinner />}Guardar en el proyecto</button>
    </div>
  );
}

function Carga({ projects, save }: { projects: Project[]; save: (fd: FormData) => Promise<R> }) {
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
            <p className="text-sm text-mute">≈ {out.kw} kW · {num(kwToBtu(out.kw))} BTU/h</p>
            <p className="mt-2 text-xs text-mute">Ocupantes {out.shares.ocupantes}% · Equipos e iluminación {out.shares.equipos}% · Envolvente {out.shares.envolvente}% · Aire exterior {out.shares.ventilacion}%</p>
          </>
        )}
      </Result>
      {out && <SaveBox projects={projects} action={save} okText="Espacio guardado en el proyecto" withUsage fields={{ ...v, orientation: o }} />}
    </section>
  );
}

function Ventilacion({ projects, save }: { projects: Project[]; save: (fd: FormData) => Promise<R> }) {
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
      {flow !== null && <SaveBox projects={projects} action={save} okText="Zona guardada en el proyecto" fields={kind === "escalera" ? { kind, doors: v.doors } : { kind, areaM2: v.areaM2, heightM: v.heightM, ach: v.ach }} />}
    </section>
  );
}

export function Calculators({ projects, saveSpace, saveZone }: { projects: Project[]; saveSpace: (fd: FormData) => Promise<R>; saveZone: (fd: FormData) => Promise<R> }) {
  return <div className="grid gap-5 xl:grid-cols-2"><Carga projects={projects} save={saveSpace} /><Ventilacion projects={projects} save={saveZone} /></div>;
}
