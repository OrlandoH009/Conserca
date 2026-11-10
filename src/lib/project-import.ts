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
  "Correo de facturación",
  "Quién autoriza la factura",
  "Responsable (correo del trabajador)",
  "Tipo de espacio *",
  "Etapa actual *",
  "Estado *",
  "Avance (%) *",
  "Fecha de inicio",
  "Fecha límite",
  "Honorarios del diseño (USD)",
  "Presupuesto estimado de construcción (USD)",
  ...COBROS.flatMap((c) => [`${c}: monto (USD)`, `${c}: estado`, `${c}: N.º de factura`, `${c}: fecha de factura`, `${c}: fecha de cobro`]),
  "Notas",
];

const STATUS = { "En proceso": "en_proceso", "En revisión": "en_revision", Entregado: "entregado", Atrasado: "atrasado" } as const;
const PAY_STATUS: Record<string, PaymentStatus> = { Pendiente: "pendiente", Facturado: "facturado", Cobrado: "cobrado" };
const NOTES_MAX = 280; // deja lugar al prefijo dentro de los 300 caracteres de la actividad

export type ImportError = { row: number; msg: string; col?: string };
export type ImportRow = {
  row: number;
  name: string;
  client: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  billingEmail: string | null;
  authorizer: string | null;
  ownerEmail: string | null;
  spaceType: string;
  stage: string;
  status: (typeof STATUS)[keyof typeof STATUS];
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  budget: number | null;
  payments: { label: string; amount: number; dueProgress: number; status: PaymentStatus; invoiceNo: string | null; invoicedAt: string | null; paidAt: string | null }[];
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
    const raw = (h: string) => {
      const at = HEADERS.indexOf(h);
      if (at < 0) throw new Error(`Columna desconocida: ${h}`); // error de programación, no del archivo
      return cells[at] ?? null;
    };
    const empty = (h: string) => raw(h) === null || String(raw(h)).trim() === "";
    const text = (h: string, max: number) => {
      const s = empty(h) ? "" : String(raw(h)).trim();
      if (s.length > max) fail("«{col}» es demasiado largo", h);
      return s;
    };
    const need = (h: string, max: number) => {
      const s = text(h, max);
      if (!s) fail("Falta «{col}»", h);
      return s;
    };
    const pick = <T extends string>(h: string, options: readonly T[]) => {
      const s = need(h, 100);
      if (s && !options.includes(s as T)) fail("«{col}» no es válido", h);
      return s as T;
    };
    const mail = (h: string) => {
      const s = text(h, 190).toLowerCase();
      if (s && !z.email().safeParse(s).success) fail("«{col}» no es válido", h);
      return s || null;
    };
    const date = (h: string) => {
      if (empty(h)) return null;
      const d = parseDate(raw(h));
      if (!d) fail("«{col}» no es válido", h);
      return d;
    };
    const amount = (h: string) => {
      if (empty(h)) return null;
      const n = parseAmount(raw(h));
      if (n === null) fail("«{col}» no es válido", h);
      return n;
    };

    const name = need("Nombre del proyecto *", 200);
    const client = need("Cliente *", 150);
    const contact = text("Persona de contacto", 150);
    const email = mail("Correo del cliente");
    const phone = text("Teléfono / WhatsApp", 40);
    const taxId = text("NIT / NRC", 40);
    const billingEmail = mail("Correo de facturación");
    const authorizer = text("Quién autoriza la factura", 150);
    const ownerEmail = mail("Responsable (correo del trabajador)");
    const spaceType = pick("Tipo de espacio *", SPACE_TYPES);
    const stage = pick("Etapa actual *", STAGES);
    const statusLabel = pick("Estado *", Object.keys(STATUS) as (keyof typeof STATUS)[]);
    const P = "Avance (%) *";
    const progress = amount(P);
    if (progress === null) { if (empty(P)) fail("Falta «{col}»", P); }
    else if (!Number.isInteger(progress) || progress > 100) fail("«{col}» no es válido", P);
    const startDate = date("Fecha de inicio");
    const dueDate = date("Fecha límite");
    const fee = amount("Honorarios del diseño (USD)");
    const budget = amount("Presupuesto estimado de construcción (USD)");

    const given = COBROS.map((c) => {
      const h = `${c}: monto (USD)`;
      const label = text(`${c}: estado`, 20);
      if (label && !(label in PAY_STATUS)) fail("«{col}» no es válido", `${c}: estado`);
      return { h, amt: amount(h), label, invoice: text(`${c}: N.º de factura`, 60), invoiced: date(`${c}: fecha de factura`), paid: date(`${c}: fecha de cobro`) };
    });
    const anyAmount = given.some((g) => g.amt);
    const split = fee && !anyAmount ? splitPlan(fee) : null;
    const payments = given.flatMap((g, c) => {
      const amt = split ? split[c].amount : g.amt;
      if (!amt) {
        if (g.label || g.invoice || g.invoiced || g.paid) fail("«{col}» tiene datos pero falta el monto", g.h);
        return [];
      }
      const status = PAY_STATUS[g.label] ?? "pendiente";
      // Las fechas solo cuentan si el estado las respalda: un cobro pendiente no tiene factura ni pago.
      return [{ label: COBROS[c], amount: amt, dueProgress: PLAN[c][2], status, invoiceNo: g.invoice || null, invoicedAt: status === "pendiente" ? null : g.invoiced, paidAt: status === "cobrado" ? g.paid : null }];
    });
    if (fee && anyAmount && payments.reduce((n, p) => n + cents(p.amount), 0) !== cents(fee)) fail("Los cobros no suman los honorarios");

    const notes = text("Notas", NOTES_MAX);
    const key = name.toLowerCase();
    if (key && seen.has(key)) fail("Ese nombre de proyecto está repetido en el archivo");
    seen.add(key);

    if (errors.length === before)
      items.push({ row, name, client, contact: contact || null, email, phone: phone || null, taxId: taxId || null, billingEmail, authorizer: authorizer || null, ownerEmail, spaceType, stage, status: STATUS[statusLabel], progress: progress!, startDate, dueDate, budget: budget || null, payments, notes: notes || null });
  });
  return { headersOk, items, errors };
}
