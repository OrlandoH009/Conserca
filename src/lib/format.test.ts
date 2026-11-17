import { describe, expect, it } from "vitest";
import { PHONE_RE } from "./format";

describe("PHONE_RE", () => {
  it("acepta formatos comunes", () => {
    for (const p of ["7777-7777", "+503 7777 7777", "(503) 7777-7777", "77777777"]) expect(PHONE_RE.test(p)).toBe(true);
  });
  it("rechaza lo corto o con letras", () => {
    for (const p of ["1234567", "abc", "7777-77a7", "-7777-7777", "()-. +"]) expect(PHONE_RE.test(p)).toBe(false);
  });
});
