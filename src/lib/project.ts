import { isoDay, todayISO } from "./format";

export const STATUS_LABEL = { en_proceso: "En proceso", en_revision: "En revisión", entregado: "Entregado", atrasado: "Atrasado" } as const;

/** Código corto para hablar de un proyecto con el cliente, p. ej. CON-2026-007. */
export const projectCode = (id: number, createdAt: Date) => `CON-${isoDay(createdAt).slice(0, 4)}-${String(id).padStart(3, "0")}`;

/** Suma días a una fecha YYYY-MM-DD. */
export const addDays = (iso: string, n: number) => new Date(Date.parse(iso) + n * 864e5).toISOString().slice(0, 10);

/** Días que faltan para una fecha YYYY-MM-DD; negativo si ya pasó. */
export const daysUntil = (iso: string) => Math.round((Date.parse(iso) - Date.parse(todayISO())) / 864e5);

/** Días que pasaron de la fecha de entrega; 0 si no hay atraso o el proyecto ya se entregó. */
export function daysLate(dueDate: string | null, status: string) {
  if (!dueDate || status === "entregado") return 0;
  const d = Math.round((new Date(todayISO()).getTime() - new Date(dueDate).getTime()) / 864e5);
  return d > 0 ? d : 0;
}
