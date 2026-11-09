import { z } from "zod";
import { PLAN, splitPlan, type PaymentStatus } from "./payments";
import { SPACE_TYPES } from "./quote-options";
import { STAGES } from "./stages";

export const MAX_ROWS = 500;

const COBROS = PLAN.map(([label]) => label);
// Las mismas columnas y en el mismo orden que public/plantilla-proyectos-previos.xlsx.
export const HEADERS = [
  "Nombre del proyecto *",
  "Cliente *",
  "Persona de contacto",
  "Correo del cliente",
  "Teléfono / WhatsApp",
  "NIT / NRC",
  "Tipo de espacio *",
  "Etapa actual *",
  "Estado *",
  "Avance (%) *",
  "Fecha de inicio",
  "Fecha límite",
  "Honorarios del diseño (USD)",
  "Presupuesto estimado de construcción (USD)",
  ...COBROS.flatMap((c) => [`${c}: monto (USD)`, `${c}: estado`, `${c}: N.º de factura`, `${c}: fecha de cobro`]),
  "Notas",
];

const STATUS = { "En proceso": "en_proceso", "En revisión": "en_revision", Entregado: "entregado", Atrasado: "atrasado" } as const;
const PAY_STATUS: Record<string, PaymentStatus> = { Pendiente: "pendiente", Facturado: "facturado", Cobrado: "cobrado" };
const NOTES_MAX = 280; // deja lugar al prefijo dentro de los 300 caracteres de la actividad

export type ImportError = { row: number; msg: string; col?: string };
export type ImportRow = {
  name: string;
  client: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  spaceType: string;
  stage: string;
  status: (typeof STATUS)[keyof typeof STATUS];
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  budget: number | null;
  payments: { label: string; amount: number; dueProgress: number; status: PaymentStatus; invoiceNo: string | null; paidAt: string | null }[];
  notes: string | null;
};
export type ImportResult = {
  error?: string;
  errors?: ImportError[];
  fresh?: { name: string; client: string }[];
  skipped?: string[];
  created?: number;
};

const ISO = (y: number, m: number, d: number) => {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date.toISOString().slice(0, 10) : null;
};

/** Excel entrega fecha real, número de serie o, si la celda quedó como texto, dd/mm/aaaa. */
export function parseDate(v: unknown): string | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString().slice(0, 10);
  if (typeof v === "number" && v >= 36526) return new Date((v - 25569) * 864e5).toISOString().slice(0, 10);
  const m = typeof v === "string" ? /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v.trim()) : null;
  return m ? ISO(+m[3], +m[2], +m[1]) : null;
}

const parseAmount = (v: unknown) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v.trim().replace(/[$,]/g, "")) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const cents = (n: number) => Math.round(n * 100);

/** Valida las filas de la hoja «Proyectos» (la primera son los encabezados). Sin base de datos: solo revisa el contenido. */
export function parseRows(rows: unknown[][]): { headersOk: boolean; items: ImportRow[]; errors: ImportError[] } {
  const headersOk = HEADERS.every((h, i) => String(rows[0]?.[i] ?? "").trim() === h);
  const items: ImportRow[] = [];
  const errors: ImportError[] = [];
  if (!headersOk) return { headersOk, items, errors };

  const seen = new Set<string>();
  rows.slice(1).forEach((cells, index) => {
    if (cells.every((c) => c === null || c === undefined || String(c).trim() === "")) return;
    const row = index + 2;
    const before = errors.length;
    const fail = (msg: string, col?: string) => { errors.push({ row, msg, col }); };
    const raw = (i: number) => cells[i] ?? null;
    const text = (i: number, max: number) => {
      const s = raw(i) === null ? "" : String(raw(i)).trim();
      if (s.length > max) fail("«{col}» es demasiado largo", HEADERS[i]);
      return s;
    };
    const need = (i: number, max: number) => {
      const s = text(i, max);
      if (!s) fail("Falta «{col}»", HEADERS[i]);
      return s;
    };
    const pick = <T extends string>(i: number, options: readonly T[]) => {
      const s = need(i, 100);
      if (s && !options.includes(s as T)) fail("«{col}» no es válido", HEADERS[i]);
      return s as T;
    };
    const date = (i: number) => {
      if (raw(i) === null || raw(i) === "") return null;
      const d = parseDate(raw(i));
      if (!d) fail("«{col}» no es válido", HEADERS[i]);
      return d;
    };
    const amount = (i: number) => {
      if (raw(i) === null || raw(i) === "") return null;
      const n = parseAmount(raw(i));
      if (n === null) fail("«{col}» no es válido", HEADERS[i]);
      return n;
    };

    const name = need(0, 200);
    const client = need(1, 150);
    const contact = text(2, 150);
    const email = text(3, 190).toLowerCase();
    if (email && !z.email().safeParse(email).success) fail("«{col}» no es válido", HEADERS[3]);
    const phone = text(4, 40);
    const taxId = text(5, 40);
    const spaceType = pick(6, SPACE_TYPES);
    const stage = pick(7, STAGES);
    const statusLabel = pick(8, Object.keys(STATUS) as (keyof typeof STATUS)[]);
    const progress = amount(9);
    if (progress === null) { if (raw(9) === null || raw(9) === "") fail("Falta «{col}»", HEADERS[9]); }
    else if (!Number.isInteger(progress) || progress > 100) fail("«{col}» no es válido", HEADERS[9]);
    const startDate = date(10);
    const dueDate = date(11);
    const fee = amount(12);
    const budget = amount(13);

    const given = COBROS.map((_, c) => {
      const at = 14 + c * 4;
      const amt = amount(at);
      const label = text(at + 1, 20);
      if (label && !(label in PAY_STATUS)) fail("«{col}» no es válido", HEADERS[at + 1]);
      return { amt, label, invoice: text(at + 2, 60), paid: date(at + 3), at };
    });
    const anyAmount = given.some((g) => g.amt);
    const split = fee && !anyAmount ? splitPlan(fee) : null;
    const payments = given.flatMap((g, c) => {
      const amt = split ? split[c].amount : g.amt;
      if (!amt) {
        if (g.label || g.invoice || g.paid) fail("«{col}» tiene datos pero falta el monto", HEADERS[g.at]);
        return [];
      }
      const status = PAY_STATUS[g.label] ?? "pendiente";
      return [{ label: COBROS[c], amount: amt, dueProgress: PLAN[c][2], status, invoiceNo: g.invoice || null, paidAt: status === "cobrado" ? g.paid : null }];
    });
    if (fee && anyAmount && payments.reduce((n, p) => n + cents(p.amount), 0) !== cents(fee)) fail("Los cobros no suman los honorarios");

    const notes = text(HEADERS.length - 1, NOTES_MAX);
    const key = name.toLowerCase();
    if (key && seen.has(key)) fail("Ese nombre de proyecto está repetido en el archivo");
    seen.add(key);

    if (errors.length === before)
      items.push({ name, client, contact: contact || null, email: email || null, phone: phone || null, taxId: taxId || null, spaceType, stage, status: STATUS[statusLabel], progress: progress!, startDate, dueDate, budget: budget || null, payments, notes: notes || null });
  });
  return { headersOk, items, errors };
}
