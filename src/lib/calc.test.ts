import { describe, expect, it } from "vitest";
import { budgetTotals, kwToBtu, coolingLoad, ventFlow } from "./calc";

describe("ventFlow", () => {
  it("volumen × cambios por hora", () => {
    expect(ventFlow({ kind: "sanitarios", areaM2: 60, heightM: 2.7, ach: 10 })).toBe(1620);
    expect(ventFlow({ kind: "estacionamiento", areaM2: 1800, heightM: 2.6, ach: 6 })).toBe(28080);
  });
  it("escalera presurizada por puertas", () => {
    expect(ventFlow({ kind: "escalera", doors: 2 })).toBe(10260);
  });
  it("rechaza entradas inválidas", () => {
    expect(() => ventFlow({ kind: "bodega", areaM2: 0, heightM: 3, ach: 4 })).toThrow(RangeError);
    expect(() => ventFlow({ kind: "bodega", areaM2: 10, heightM: 3 })).toThrow(RangeError);
    expect(() => ventFlow({ kind: "escalera", doors: 0 })).toThrow(RangeError);
  });
});

describe("coolingLoad", () => {
  const base = { areaM2: 100, heightM: 3, people: 10, equipmentW: 2000, lightingWm2: 10, orientation: "sur" as const };
  it("suma ocupantes, equipos, envolvente y aire exterior", () => {
    const r = coolingLoad(base);
    expect(r.kw).toBeCloseTo(10.12, 1);
    expect(r.tr).toBeCloseTo(2.88, 1);
    const total = Object.values(r.shares).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(99);
    expect(total).toBeLessThanOrEqual(101);
  });
  it("oeste carga más que norte", () => {
    expect(coolingLoad({ ...base, orientation: "oeste" }).kw).toBeGreaterThan(coolingLoad({ ...base, orientation: "norte" }).kw);
  });
  it("rechaza área cero, negativos y NaN", () => {
    expect(() => coolingLoad({ ...base, areaM2: 0 })).toThrow(RangeError);
    expect(() => coolingLoad({ ...base, people: -1 })).toThrow(RangeError);
    expect(() => coolingLoad({ ...base, heightM: NaN })).toThrow(RangeError);
  });
});

describe("budgetTotals", () => {
  it("subtotal, IVA 13 % y total", () => {
    expect(budgetTotals([{ quantity: 2, unitPrice: 100 }, { quantity: 1, unitPrice: 50 }])).toEqual({ subtotal: 250, iva: 32.5, total: 282.5 });
    expect(budgetTotals([])).toEqual({ subtotal: 0, iva: 0, total: 0 });
  });
});

describe("kwToBtu", () => {
  it("convierte kW a BTU/h", () => {
    expect(kwToBtu(1)).toBe(3412);
    expect(kwToBtu(13.49)).toBe(46030);
    expect(kwToBtu(0)).toBe(0);
  });
});
