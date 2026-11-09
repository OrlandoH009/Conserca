import Link from "next/link";
import { getT } from "@/lib/i18n-server";

const SHOWN = 5;

/** Aviso fijo arriba del panel: proyectos sin entregar que vencen en 7 días o menos, o que ya vencieron. */
export async function DeadlineAlert({ rows }: { rows: { id: number; name: string; days: number }[] }) {
  const t = await getT();
  const when = (d: number) =>
    d < -1 ? t("Venció hace {n} días", { n: -d }) : d === -1 ? t("Venció ayer") : d === 0 ? t("Vence hoy") : d === 1 ? t("Vence mañana") : t("Vence en {n} días", { n: d });
  const late = rows.some((r) => r.days < 0);
  return (
    <section role="status" aria-label={t("Fechas límite próximas")} className={`mb-5 rounded-xl px-4 py-3 text-sm print:hidden ${late ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>
      <p className="font-bold">{t("Fechas límite próximas")}</p>
      <ul className="mt-1 space-y-0.5">
        {rows.slice(0, SHOWN).map((r) => (
          <li key={r.id}><Link href={`/app/proyectos/${r.id}`} className="font-semibold underline">{r.name}</Link> · {when(r.days)}</li>
        ))}
      </ul>
      {rows.length > SHOWN && <p className="mt-1"><Link href="/app/proyectos" className="underline">{t("Y {n} más en Proyectos", { n: rows.length - SHOWN })}</Link></p>}
    </section>
  );
}
