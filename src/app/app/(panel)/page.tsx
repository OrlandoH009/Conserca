import Link from "next/link";
import * as DashboardController from "@/controllers/dashboard.controller";
import { CountUp } from "@/components/motion/CountUp";
import { PageHead, StatusBadge, Badge, Empty, PROJECT_STATUS } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { fmtDate, todayISO } from "@/lib/format";
import { can } from "@/lib/permissions";
import { daysLate } from "@/lib/project";

const BAR = { en_proceso: "bg-accent-solid", en_revision: "bg-amber-500", entregado: "bg-emerald-500", atrasado: "bg-red-500" } as const;

/** "hoy", "mañana" o "en N días" para una fecha YYYY-MM-DD. */
function cuando(date: string) {
  const d = Math.round((new Date(date).getTime() - new Date(todayISO()).getTime()) / 864e5);
  return d <= 0 ? "hoy" : d === 1 ? "mañana" : `en ${d} días`;
}

export default async function Panel({ searchParams }: PageProps<"/app">) {
  const sp = await searchParams;
  const [s, u] = await Promise.all([DashboardController.summary(), currentUser()]);

  const kpis: [string, number | null, string][] = [
    ["Proyectos activos", s.active, "/app/proyectos"],
    ["Cotizaciones por responder", s.newQuotes, "/app/clientes?estado=nueva"],
    ["Visitas programadas", s.scheduled, "/app/proyectos"],
    ["Documentos por revisar", s.toReview, "/app/proyectos"],
    ["Proyectos vencidos", s.overdue.length, "/app/proyectos"],
  ];
  const total = s.byStatus.reduce((n, r) => n + r.n, 0);
  const quick: [string, string][] = [
    ["/app/proyectos", "Ver proyectos"],
    ...(u && can(u.role, "clientes") ? ([["/app/clientes", `Cotizaciones${s.newQuotes ? ` (${s.newQuotes} nuevas)` : ""}`]] as [string, string][]) : []),
    ...(u && can(u.role, "calculos") ? ([["/app/calculadoras", "Calculadoras"]] as [string, string][]) : []),
    ...(u && can(u.role, "catalogo") ? ([["/app/catalogo", "Catálogo de equipos"]] as [string, string][]) : []),
  ];

  return (
    <>
      <PageHead title="Panel general" sub="Resumen del trabajo del equipo" />
      {sp.sinpermiso && <p role="alert" className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Tu rol no tiene acceso a esa sección.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.filter(([, v]) => v !== null).map(([l, v, href]) => (
          <Link key={l} href={href} className="card transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-mute">{l}</p>
            <p className={`mt-1 text-4xl font-bold tracking-tight ${l === "Proyectos vencidos" && v ? "text-red-600" : ""}`}><CountUp to={v!} /></p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <section className="card">
            <h2 className="mb-3 font-bold">Proyectos recientes</h2>
            {s.recent.length === 0 ? <Empty>Aún no hay proyectos.</Empty> : (
              <table className="tbl">
                <thead><tr><th>Proyecto</th><th>Etapa</th><th>Entrega</th><th>Estado</th></tr></thead>
                <tbody>
                  {s.recent.map((p) => {
                    const late = daysLate(p.dueDate, p.status);
                    return (
                      <tr key={p.id}>
                        <td><Link href={`/app/proyectos/${p.id}`} className="font-medium hover:text-accent">{p.name}</Link></td>
                        <td>{p.stage}</td>
                        <td>{fmtDate(p.dueDate)}{late > 0 && <span className="ml-1.5 align-middle"><Badge tone="r">Vencido</Badge></span>}</td>
                        <td><StatusBadge status={p.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          <section className="card">
            <h2 className="mb-3 font-bold">Proyectos por estado</h2>
            {total === 0 ? <Empty>Aún no hay proyectos.</Empty> : (
              <ul className="space-y-3">
                {(Object.keys(PROJECT_STATUS) as (keyof typeof PROJECT_STATUS)[]).map((k) => {
                  const n = s.byStatus.find((r) => r.status === k)?.n ?? 0;
                  return (
                    <li key={k} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm">
                      <span className="text-mute">{PROJECT_STATUS[k][0]}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-slate-100"><span className={`bar-fill block h-full rounded-full ${BAR[k]}`} style={{ width: `${(n / total) * 100}%` }} /></span>
                      <b className="text-right tabular-nums">{n}</b>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="card">
            <h2 className="mb-3 font-bold">Acciones rápidas</h2>
            <div className="flex flex-wrap gap-2">
              {quick.map(([href, label]) => <Link key={href} href={href} className="btn-ghost px-3 py-1.5 text-sm">{label}</Link>)}
            </div>
          </section>

          <section className="card">
            <h2 className="mb-3 font-bold">Próximas visitas</h2>
            {s.upcoming.length === 0 ? <Empty>No hay visitas programadas.</Empty> : s.upcoming.map((v) => (
              <Link key={v.id} href={`/app/proyectos/${v.projectId}?tab=supervision`} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
                <div className="min-w-0"><p className="font-semibold">{fmtDate(v.date)} <span className="text-sm font-normal text-mute">· {cuando(v.date)}</span></p><p className="truncate text-sm text-mute">{v.project}</p></div>
                <Badge tone="b">Supervisión</Badge>
              </Link>
            ))}
          </section>

          {s.overdue.length > 0 && (
            <section className="card">
              <h2 className="mb-3 font-bold text-red-600">Vencidos</h2>
              {s.overdue.map((p) => {
                const late = daysLate(p.dueDate, p.status);
                return (
                  <Link key={p.id} href={`/app/proyectos/${p.id}`} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
                    <p className="min-w-0 truncate font-semibold">{p.name}</p>
                    <Badge tone="r">{late} {late === 1 ? "día" : "días"}</Badge>
                  </Link>
                );
              })}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
