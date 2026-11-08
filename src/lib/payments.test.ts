import { describe, expect, it } from "vitest";
import { isDue, nearYearEnd, splitPlan } from "./payments";

describe("plan de cobros", () => {
  it("el reparto suma exactamente el total", () => {
    for (const total of [10000, 3333.33, 0.01, 12345.67]) {
      const sum = splitPlan(total).reduce((n, p) => n + Math.round(p.amount * 100), 0);
      expect(sum).toBe(Math.round(total * 100));
    }
  });
  it("toca facturar solo si está pendiente y el avance llegó", () => {
    const est1 = { status: "pendiente", dueProgress: 40 };
    expect(isDue(est1, { progress: 39, status: "en_proceso" })).toBe(false);
    expect(isDue(est1, { progress: 40, status: "en_proceso" })).toBe(true);
    expect(isDue(est1, { progress: 10, status: "entregado" })).toBe(true); // entregado: todo se puede facturar
    expect(isDue({ ...est1, status: "facturado" }, { progress: 100, status: "entregado" })).toBe(false);
  });
  it("toca facturar: casos límite", () => {
    const anticipo = { status: "pendiente", dueProgress: 0 };
    const final = { status: "pendiente", dueProgress: 100 };
    expect(isDue(anticipo, { progress: 0, status: "en_proceso" })).toBe(true); // el anticipo toca desde el inicio
    expect(isDue(final, { progress: 99, status: "en_revision" })).toBe(false);
    expect(isDue(final, { progress: 100, status: "en_proceso" })).toBe(true);
    expect(isDue(final, { progress: 0, status: "entregado" })).toBe(true); // entregado con avance 0: se cobra todo
    expect(isDue(final, { progress: 0, status: "atrasado" })).toBe(false); // atrasado no es entregado
    expect(isDue({ ...final, status: "cobrado" }, { progress: 100, status: "entregado" })).toBe(false);
  });
  it("cierre de año: noviembre y diciembre", () => {
    expect(nearYearEnd("2026-10-31")).toBe(false);
    expect(nearYearEnd("2026-11-01")).toBe(true);
    expect(nearYearEnd("2026-12-31")).toBe(true);
  });
});
