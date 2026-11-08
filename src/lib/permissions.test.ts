import { describe, expect, it } from "vitest";
import { can, levelOf, ROLE_LABEL } from "./permissions";

describe("permisos por rol", () => {
  it("admin edita todo", () => {
    for (const a of ["proyectos", "documentos", "calculos", "presupuestos", "cobros", "supervision", "clientes", "catalogo", "usuarios"] as const) {
      expect(can("admin", a, "edit")).toBe(true);
    }
  });
  it("ingeniería hace supervisión pero solo ve presupuestos y no ve clientes", () => {
    expect(can("ingenieria", "supervision", "edit")).toBe(true);
    expect(can("ingenieria", "presupuestos", "edit")).toBe(false);
    expect(can("ingenieria", "clientes")).toBe(false);
  });
  it("los cobros (facturación) son solo del Gerente", () => {
    expect(can("admin", "cobros", "edit")).toBe(true);
    expect(can("ingenieria", "cobros")).toBe(false);
    expect(can("dibujo", "cobros")).toBe(false);
  });
  it("técnico en dibujo sube documentos pero no cambia proyectos ni ve clientes", () => {
    expect(can("dibujo", "documentos", "edit")).toBe(true);
    expect(can("dibujo", "proyectos", "edit")).toBe(false);
    expect(can("dibujo", "proyectos")).toBe(true);
    expect(can("dibujo", "clientes")).toBe(false);
  });
  it("solo admin gestiona usuarios", () => {
    expect(levelOf("ingenieria", "usuarios")).toBe("none");
    expect(levelOf("admin", "usuarios")).toBe("edit");
  });
  it("la cuenta de sitio (usuario) no accede a ninguna área del panel", () => {
    for (const a of ["proyectos", "documentos", "calculos", "presupuestos", "cobros", "supervision", "clientes", "catalogo", "usuarios"] as const) {
      expect(can("usuario", a)).toBe(false);
    }
  });
  it("el rol «usuario» se muestra como Cliente", () => {
    expect(ROLE_LABEL.usuario).toBe("Cliente");
  });
  it("ingeniería y dibujo no entran a cobros, clientes ni usuarios", () => {
    for (const r of ["ingenieria", "dibujo"] as const) for (const a of ["cobros", "clientes", "usuarios"] as const) expect(can(r, a)).toBe(false);
  });
  it("un rol desconocido no tiene acceso", () => {
    expect(can("invitado" as never, "proyectos")).toBe(false);
  });
});
