import Link from "next/link";
import * as DashboardController from "@/controllers/dashboard.controller";
import { CountUp } from "@/components/motion/CountUp";
import { PageHead, StatusBadge, Badge, Empty } from "@/components/app/ui";
import { fmtDate } from "@/lib/format";

export default async function Panel({ searchParams }: PageProps<"/app">) {
  const sp = await searchParams;
  const s = await DashboardController.summary();

  const kpis: [string, number | null, string][] = [
    ["Proyectos activos", s.active, "/app/proyectos"],
    ["Cotizaciones por responder", s.newQuotes, "/app/clientes"],
    ["Visitas programadas", s.scheduled, "/app/proyectos"],
    ["Documentos por revisar", s.toReview, "/app/proyectos"],
  ];

  return (
    <>
      <PageHead title="Panel general" sub="Resumen del trabajo del equipo" />
      {sp.sinpermiso && <p role="alert" className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Tu rol no tiene acceso a esa sección.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.filter(([, v]) => v !== null).map(([l, v, href]) => (
          <Link key={l} href={href} className="card transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-mute">{l}</p>
            <p className="mt-1 text-4xl font-bold tracking-tight"><CountUp to={v!} /></p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="card">
          <h2 className="mb-3 font-bold">Proyectos recientes</h2>
          {s.recent.length === 0 ? <Empty>Aún no hay proyectos.</Empty> : (
            <table className="tbl">
              <thead><tr><th>Proyecto</th><th>Etapa</th><th>Entrega</th><th>Estado</th></tr></thead>
              <tbody>
                {s.recent.map((p) => (
                  <tr key={p.id}>
                    <td><Link href={`/app/proyectos/${p.id}`} className="font-medium hover:text-accent">{p.name}</Link></td>
                    <td>{p.stage}</td><td>{fmtDate(p.dueDate)}</td><td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section className="card">
          <h2 className="mb-3 font-bold">Próximas visitas</h2>
          {s.upcoming.length === 0 ? <Empty>No hay visitas programadas.</Empty> : s.upcoming.map((v) => (
            <Link key={v.id} href={`/app/proyectos/${v.projectId}?tab=supervision`} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
              <div><p className="font-semibold">{fmtDate(v.date)}</p><p className="text-sm text-mute">{v.project}</p></div>
              <Badge tone="b">Supervisión</Badge>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
