"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { Spinner } from "@/components/app/SubmitButton";
import { useT } from "@/components/site/LocaleProvider";
import type { ImportResult } from "@/lib/project-import";
import { importProjects } from "../actions";

const SHOWN = 50;

export function ImportForm() {
  const t = useT();
  const [state, run, pending] = useActionState<ImportResult, FormData>(importProjects, {});
  const errors = state.errors ?? [];
  const fresh = state.fresh ?? [];
  const skipped = state.skipped ?? [];
  const ready = state.fresh !== undefined && errors.length === 0 && fresh.length > 0;

  // Sin <form action>: React vaciaría el archivo elegido y no se podría confirmar la importación.
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if ((e.nativeEvent as SubmitEvent).submitter?.getAttribute("name") === "commit") fd.set("commit", "1");
    startTransition(() => run(fd));
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="card">
        <label className="label" htmlFor="file">{t("Archivo Excel (.xlsx) de hasta 5 MB")}</label>
        <input id="file" name="file" type="file" accept=".xlsx" required className="input" />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn-ghost" disabled={pending}>{pending ? <><Spinner /> {t("Revisando…")}</> : t("Revisar archivo")}</button>
          {ready && <button name="commit" value="1" className="btn" disabled={pending}>{t("Cargar {n} proyectos", { n: fresh.length })}</button>}
          {state.error && <p role="alert" className="text-sm text-red-700">{t(state.error)}</p>}
        </div>
      </form>

      {state.created !== undefined && (
        <p role="status" className="rounded-xl bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
          {t("Se cargaron {n} proyectos.", { n: state.created })} <Link href="/app/proyectos" className="font-semibold underline">{t("Ver proyectos")}</Link>
        </p>
      )}

      {errors.length > 0 && (
        <section className="card" role="alert">
          <h2 className="mb-1 font-bold text-red-600">{t("Corrige estas filas y vuelve a subir el archivo")}</h2>
          <p className="mb-3 text-sm text-mute">{t("No se cargó ningún proyecto.")}</p>
          <ul className="space-y-1 text-sm">
            {errors.slice(0, SHOWN).map((e, i) => <li key={i}><b>{t("Fila {row}", { row: e.row })}:</b> {t(e.msg, { col: e.col ?? "" })}</li>)}
          </ul>
          {errors.length > SHOWN && <p className="mt-2 text-sm text-mute">{t("Y {n} más.", { n: errors.length - SHOWN })}</p>}
        </section>
      )}

      {fresh.length > 0 && (
        <section className="card">
          <h2 className="mb-3 font-bold">{t("Proyectos listos para cargar")} <span className="text-sm font-normal text-mute">({fresh.length})</span></h2>
          <ul className="divide-y divide-line text-sm">
            {fresh.slice(0, SHOWN).map((r) => <li key={r.name} className="py-2"><b>{r.name}</b> · {r.client}</li>)}
          </ul>
          {fresh.length > SHOWN && <p className="mt-2 text-sm text-mute">{t("Y {n} más.", { n: fresh.length - SHOWN })}</p>}
        </section>
      )}

      {skipped.length > 0 && (
        <section className="card">
          <h2 className="mb-1 font-bold">{t("Ya existen y se omiten")} <span className="text-sm font-normal text-mute">({skipped.length})</span></h2>
          <p className="text-sm text-mute">{skipped.slice(0, SHOWN).join(", ")}</p>
        </section>
      )}
    </div>
  );
}
