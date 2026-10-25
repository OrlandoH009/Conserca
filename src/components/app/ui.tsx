import type { ReactNode } from "react";

const TONES = {
  g: "bg-emerald-100 text-emerald-800",
  a: "bg-amber-100 text-amber-800",
  b: "bg-soft text-accent",
  r: "bg-red-100 text-red-800",
  n: "bg-slate-100 text-slate-600",
} as const;

export function Badge({ tone = "n", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={`badge ${TONES[tone]}`}>{children}</span>;
}

export const PROJECT_STATUS = {
  en_proceso: ["En proceso", "b"],
  en_revision: ["En revisión", "a"],
  entregado: ["Entregado", "g"],
  atrasado: ["Atrasado", "r"],
} as const;

export function StatusBadge({ status }: { status: keyof typeof PROJECT_STATUS }) {
  const [label, tone] = PROJECT_STATUS[status] ?? ["—", "n"];
  return <Badge tone={tone}>{label}</Badge>;
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-mute">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function Estimado() {
  return <p className="mt-3 text-xs text-mute">Estimado con fórmulas simplificadas. Validar por ingeniería antes de usarse.</p>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-mute">{children}</p>;
}
