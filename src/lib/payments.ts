// Plan de cobros por defecto del diseño HVAC: [concepto, % del contrato, avance (%) desde el cual toca facturar].
// Son valores de partida; el equipo los ajusta por proyecto.
export const PLAN = [
  ["Anticipo", 30, 0],
  ["Estimación 1", 30, 40],
  ["Estimación 2", 20, 70],
  ["Pago final", 20, 100],
] as const;

export type PaymentStatus = "pendiente" | "facturado" | "cobrado";

/** Reparte el total entre los cobros del plan; el último absorbe el redondeo para que la suma sea exacta. */
export function splitPlan(total: number) {
  const cents = Math.round(total * 100);
  let left = cents;
  return PLAN.map(([label, pct, dueProgress], i) => {
    const part = i === PLAN.length - 1 ? left : Math.round((cents * pct) / 100);
    left -= part;
    return { label, amount: part / 100, dueProgress };
  });
}

/** Toca facturar: sigue pendiente y el proyecto ya llegó al avance de ese cobro (o ya se entregó). */
export const isDue = (pay: { status: string; dueProgress: number }, project: { progress: number; status: string }) =>
  pay.status === "pendiente" && (project.status === "entregado" || project.progress >= pay.dueProgress);

/** Noviembre y diciembre: lo que no se facture ahora puede quedar fuera del año (pasó con un proyecto). `today` = YYYY-MM-DD. */
export const nearYearEnd = (today: string) => Number(today.slice(5, 7)) >= 11;
