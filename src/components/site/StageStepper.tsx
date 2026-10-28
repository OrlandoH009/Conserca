import { STAGES, stageIndex } from "@/lib/stages";

/**
 * Las etapas del proyecto como línea de pasos: las hechas llevan palomita, la actual resalta y las que faltan quedan apagadas.
 * Un proyecto entregado las muestra todas hechas. Si la etapa guardada no está en la lista, solo se escribe su nombre.
 */
export function StageStepper({ stage, delivered }: { stage: string; delivered: boolean }) {
  const current = delivered ? STAGES.length : stageIndex(stage);
  if (current < 0) return <p className="text-sm text-mute">Etapa actual: <b className="text-ink">{stage}</b></p>;
  return (
    <ol className="grid gap-2 sm:grid-cols-6 sm:gap-1" aria-label="Etapas del proyecto">
      {STAGES.map((s, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={s} aria-current={now ? "step" : undefined} className="relative flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
            {/* línea que une con el paso anterior (solo en pantallas anchas) */}
            {i > 0 && <span aria-hidden className={`absolute right-1/2 top-4 hidden h-0.5 w-full sm:block ${i <= current ? "bg-accent-solid" : "bg-line"}`} />}
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${done ? "border-accent-solid bg-accent-solid text-white" : now ? "border-accent-solid bg-surface text-accent ring-4 ring-soft" : "border-line bg-surface text-mute"}`}>
              {done ? "✓" : i + 1}
            </span>
            <span className={`text-sm leading-tight ${now ? "font-semibold text-ink" : done ? "text-ink" : "text-mute"}`}>
              {s}
              {now && <span className="sr-only"> (etapa actual)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
