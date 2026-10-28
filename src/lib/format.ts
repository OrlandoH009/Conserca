import { CONFIG } from "./config";

/** Fecha 'YYYY-MM-DD' → "15 nov 2026" (sin saltos de zona horaria). */
export function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(CONFIG.locale, { day: "numeric", month: "short", year: "numeric" });
}

/** Momento exacto → "24 oct 2026, 8:30 p. m." en la hora de El Salvador. */
export const fmtDateTime = (d: Date) =>
  d.toLocaleString(CONFIG.locale, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: CONFIG.timeZone });

/** Día calendario (YYYY-MM-DD) de un momento, en la zona de El Salvador (el de UTC puede ser el día siguiente por la tarde-noche). */
export const isoDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: CONFIG.timeZone });

/** Hoy (YYYY-MM-DD) en la zona de El Salvador. */
export const todayISO = () => isoDay(new Date());
