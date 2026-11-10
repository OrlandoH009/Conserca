import { readSheet } from "read-excel-file/node";
import { describe, expect, it } from "vitest";
import { HEADERS, parseDate, parseRows } from "./project-import";

const base: Record<string, unknown> = {
  "Nombre del proyecto *": "Torre A",
  "Cliente *": "Inversiones S.A.",
  "Tipo de espacio *": "Oficinas",
  "Etapa actual *": "Entrega",
  "Estado *": "En proceso",
  "Avance (%) *": 70,
};
const row = (over: Record<string, unknown> = {}) => HEADERS.map((h) => ({ ...base, ...over })[h] ?? null);
const parse = (...rows: unknown[][]) => parseRows([HEADERS, ...rows]);

describe("importar proyectos", () => {
  it("acepta una fila mínima y sin montos no crea cobros", () => {
    const { items, errors } = parse(row());
    expect(errors).toEqual([]);
    expect(items[0]).toMatchObject({ name: "Torre A", status: "en_proceso", progress: 70, payments: [] });
  });
  it("rechaza un archivo con otras columnas", () => {
    expect(parseRows([["Nombre"], ["x"]]).headersOk).toBe(false);
  });
  it("ignora filas vacías y reporta el número de fila de Excel", () => {
    const { errors } = parse(HEADERS.map(() => null), row({ "Cliente *": null }));
    expect(errors).toEqual([{ row: 3, msg: "Falta «{col}»", col: "Cliente *" }]);
  });
  it("sin montos de cobro, reparte los honorarios en inicial y final", () => {
    const { items } = parse(row({ "Honorarios del diseño (USD)": 9000.01, "Cobro inicial: estado": "Cobrado" }));
    expect(items[0].payments.map((p) => [p.label, p.amount, p.dueProgress, p.status])).toEqual([["Cobro inicial", 4500.01, 0, "cobrado"], ["Cobro final", 4500, 100, "pendiente"]]);
  });
  it("los cobros escritos deben sumar los honorarios", () => {
    const over = { "Honorarios del diseño (USD)": 9000, "Cobro inicial: monto (USD)": 4500, "Cobro final: monto (USD)": 4000 };
    expect(parse(row(over)).errors[0].msg).toBe("Los cobros no suman los honorarios");
    expect(parse(row({ ...over, "Cobro final: monto (USD)": 4500 })).errors).toEqual([]);
  });
  it("un estado de cobro sin monto es error", () => {
    expect(parse(row({ "Cobro final: estado": "Cobrado" })).errors[0]).toMatchObject({ msg: "«{col}» tiene datos pero falta el monto", col: "Cobro final: monto (USD)" });
  });
  it("valida listas, avance, correo y nombres repetidos", () => {
    expect(parse(row({ "Estado *": "Listo" })).errors[0].col).toBe("Estado *");
    for (const bad of [101, 3.5, "mucho", -1]) expect(parse(row({ "Avance (%) *": bad })).errors[0].col).toBe("Avance (%) *");
    expect(parse(row({ "Avance (%) *": 0 })).errors).toEqual([]);
    expect(parse(row({ "Correo del cliente": "no-es-correo" })).errors[0].col).toBe("Correo del cliente");
    expect(parse(row(), row({ "Nombre del proyecto *": "torre a" })).errors[0]).toMatchObject({ row: 3, msg: "Ese nombre de proyecto está repetido en el archivo" });
  });
  it("guarda facturación, responsable y fechas de factura solo si el estado las respalda", () => {
    const { items, errors } = parse(row({
      "Correo de facturación": "Pagos@Ejemplo.com", "Quién autoriza la factura": "Ana Pérez", "Responsable (correo del trabajador)": "ing@conserca.com",
      "Honorarios del diseño (USD)": 9000, "Cobro inicial: estado": "Cobrado", "Cobro inicial: fecha de factura": "01/03/2026", "Cobro inicial: fecha de cobro": "02/03/2026",
      "Cobro final: fecha de factura": "01/04/2026",
    }));
    expect(errors).toEqual([]);
    expect(items[0]).toMatchObject({ row: 2, billingEmail: "pagos@ejemplo.com", authorizer: "Ana Pérez", ownerEmail: "ing@conserca.com" });
    expect(items[0].payments.map((p) => [p.invoicedAt, p.paidAt])).toEqual([["2026-03-01", "2026-03-02"], [null, null]]);
    expect(parse(row({ "Responsable (correo del trabajador)": "x" })).errors[0].col).toBe("Responsable (correo del trabajador)");
  });
  it("la plantilla publicada tiene estas columnas y su fila de ejemplo es válida", async () => {
    const file = "public/plantilla-proyectos-previos.xlsx";
    expect(parseRows(await readSheet(file, "Proyectos"))).toMatchObject({ headersOk: true, items: [], errors: [] });
    const ex = parseRows(await readSheet(file, "Ejemplo"));
    expect(ex.errors).toEqual([]);
    expect(ex.items).toHaveLength(1);
  });
  it("lee fechas reales, de serie y de texto; rechaza las imposibles", () => {
    expect(parseDate(new Date(Date.UTC(2026, 11, 15)))).toBe("2026-12-15");
    expect(parseDate(46371)).toBe("2026-12-15");
    expect(parseDate("15/12/2026")).toBe("2026-12-15");
    expect(parseDate("31/02/2026")).toBeNull();
    expect(parseDate("mañana")).toBeNull();
  });
});
