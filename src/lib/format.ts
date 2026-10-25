/** Fecha 'YYYY-MM-DD' → "15 nov 2026" (sin saltos de zona horaria). */
export function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

export const fmtDateTime = (d: Date) => d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
