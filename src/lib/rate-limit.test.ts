import { describe, expect, it } from "vitest";
import { hit } from "./rate-limit";

describe("límite de intentos", () => {
  it("permite hasta el máximo y bloquea el siguiente", () => {
    const t = 1_000;
    for (let i = 0; i < 3; i++) expect(hit("a", 3, 60_000, t)).toBe(true);
    expect(hit("a", 3, 60_000, t)).toBe(false);
  });
  it("cada clave cuenta por separado y la ventana se reinicia", () => {
    for (let i = 0; i < 3; i++) hit("b", 2, 1_000, 0);
    expect(hit("b", 2, 1_000, 0)).toBe(false);
    expect(hit("c", 2, 1_000, 0)).toBe(true);
    expect(hit("b", 2, 1_000, 1_001)).toBe(true); // pasó la ventana
  });
});
