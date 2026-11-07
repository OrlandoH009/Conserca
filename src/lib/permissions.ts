export type Role = "admin" | "ingenieria" | "dibujo" | "usuario";
export type Area = "proyectos" | "documentos" | "calculos" | "presupuestos" | "cobros" | "supervision" | "clientes" | "catalogo" | "usuarios";
export type Level = "none" | "view" | "edit";

export const ROLES: Role[] = ["admin", "ingenieria", "dibujo", "usuario"];
// Roles fijos: el equipo de diseño HVAC (Gerente de Diseño, Ing. Diseñador y Técnico en Dibujo) y la cuenta de usuario del sitio.
export const ROLE_LABEL: Record<Role, string> = {
  admin: "Gerente de Diseño",
  ingenieria: "Ing. Diseñador",
  dibujo: "Técnico en Dibujo",
  usuario: "Usuario (sitio)",
};

// "cobros" (facturación y pagos) solo lo ve el Gerente, que es quien factura; el Ing. Diseñador hace las visitas de supervisión; "documentos" permite subir planos y memorias sin tocar el estado del proyecto.
const MATRIX: Record<Role, Record<Area, Level>> = {
  admin: { proyectos: "edit", documentos: "edit", calculos: "edit", presupuestos: "edit", cobros: "edit", supervision: "edit", clientes: "edit", catalogo: "edit", usuarios: "edit" },
  ingenieria: { proyectos: "edit", documentos: "edit", calculos: "edit", presupuestos: "view", cobros: "none", supervision: "edit", clientes: "none", catalogo: "edit", usuarios: "none" },
  dibujo: { proyectos: "view", documentos: "edit", calculos: "view", presupuestos: "none", cobros: "none", supervision: "none", clientes: "none", catalogo: "view", usuarios: "none" },
  // Cuenta del sitio público: sin acceso al panel interno, solo acciones normales (cotizar, ver el sitio).
  usuario: { proyectos: "none", documentos: "none", calculos: "none", presupuestos: "none", cobros: "none", supervision: "none", clientes: "none", catalogo: "none", usuarios: "none" },
};

export const levelOf = (role: Role, area: Area): Level => MATRIX[role]?.[area] ?? "none";

export function can(role: Role, area: Area, need: "view" | "edit" = "view") {
  const l = levelOf(role, area);
  return need === "view" ? l !== "none" : l === "edit";
}
