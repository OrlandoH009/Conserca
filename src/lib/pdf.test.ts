import { describe, expect, it } from "vitest";
import { isPdf } from "./pdf";

describe("isPdf", () => {
  it("acepta la cabecera de un PDF", () => expect(isPdf(new TextEncoder().encode("%PDF-1.7\n..."))).toBe(true));
  it("rechaza otros archivos y vacíos", () => {
    expect(isPdf(new TextEncoder().encode("<html>"))).toBe(false);
    expect(isPdf(new Uint8Array())).toBe(false);
  });
});
