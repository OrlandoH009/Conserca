import { describe, expect, it } from "vitest";
import { can, levelOf } from "./permissions";

describe("permisos por rol", () => {
  it("admin edita todo", () => {
    for (const a of ["proyectos", "calculos", "presupuestos", "supervision", "clientes", "catalogo", "usuarios"] as const) {
      expect(can("admin", a, "edit")).toBe(true);
    }
  });
  it("supervisión no ve presupuestos ni clientes", () => {
    expect(can("supervision", "presupuestos")).toBe(false);
    expect(can("supervision", "clientes")).toBe(false);
    expect(can("supervision", "supervision", "edit")).toBe(true);
  });
  it("presupuestos edita presupuestos pero solo ve cálculos", () => {
    expect(can("presupuestos", "presupuestos", "edit")).toBe(true);
    expect(can("presupuestos", "calculos", "edit")).toBe(false);
    expect(can("presupuestos", "calculos", "view")).toBe(true);
  });
  it("solo admin gestiona usuarios", () => {
    expect(levelOf("ingenieria", "usuarios")).toBe("none");
    expect(levelOf("admin", "usuarios")).toBe("edit");
  });
  it("la cuenta de sitio (usuario) no accede a ninguna área del panel", () => {
    for (const a of ["proyectos", "calculos", "presupuestos", "supervision", "clientes", "catalogo", "usuarios"] as const) {
      expect(can("usuario", a)).toBe(false);
    }
  });
  it("un rol desconocido no tiene acceso", () => {
    expect(can("invitado" as never, "proyectos")).toBe(false);
  });
});
