import { describe, expect, it } from "vitest";
import { todayISO } from "./format";
import { addDays, effectiveStatus } from "./project";
import { DELIVERY_STAGE, STAGES, statusForStage, suggestedProgress } from "./stages";

describe("estado y avance automáticos", () => {
  it("effectiveStatus: atrasado solo si pasó la fecha y no está entregado", () => {
    const ayer = addDays(todayISO(), -1);
    expect(effectiveStatus(ayer, "en_proceso")).toBe("atrasado");
    expect(effectiveStatus(ayer, "entregado")).toBe("entregado");
    expect(effectiveStatus(addDays(todayISO(), 3), "en_proceso")).toBe("en_proceso");
    expect(effectiveStatus(null, "en_proceso")).toBe("en_proceso");
  });

  it("las 5 primeras etapas son «en proceso» y la última es «entregado» con 100 %", () => {
    expect(STAGES).toHaveLength(6);
    expect(STAGES.map(statusForStage)).toEqual(["en_proceso", "en_proceso", "en_proceso", "en_proceso", "en_proceso", "entregado"]);
    expect(STAGES.map(suggestedProgress)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(suggestedProgress(DELIVERY_STAGE)).toBe(100);
    expect(suggestedProgress("otra")).toBeNull();
  });
});
