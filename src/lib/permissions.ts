export type Role = "admin" | "ingenieria" | "presupuestos" | "supervision" | "usuario";
export type Area = "proyectos" | "calculos" | "presupuestos" | "supervision" | "clientes" | "catalogo" | "usuarios";
export type Level = "none" | "view" | "edit";

export const ROLES: Role[] = ["admin", "ingenieria", "presupuestos", "supervision", "usuario"];
export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administración",
  ingenieria: "Ingeniería",
  presupuestos: "Presupuestos",
  supervision: "Supervisión",
  usuario: "Usuario (sitio)",
};

const MATRIX: Record<Role, Record<Area, Level>> = {
  admin: { proyectos: "edit", calculos: "edit", presupuestos: "edit", supervision: "edit", clientes: "edit", catalogo: "edit", usuarios: "edit" },
  ingenieria: { proyectos: "edit", calculos: "edit", presupuestos: "view", supervision: "view", clientes: "none", catalogo: "edit", usuarios: "none" },
  presupuestos: { proyectos: "view", calculos: "view", presupuestos: "edit", supervision: "none", clientes: "view", catalogo: "view", usuarios: "none" },
  supervision: { proyectos: "view", calculos: "view", presupuestos: "none", supervision: "edit", clientes: "none", catalogo: "view", usuarios: "none" },
  // Cuenta del sitio público: sin acceso al panel interno, solo acciones normales (cotizar, ver el sitio).
  usuario: { proyectos: "none", calculos: "none", presupuestos: "none", supervision: "none", clientes: "none", catalogo: "none", usuarios: "none" },
};

export const levelOf = (role: Role, area: Area): Level => MATRIX[role]?.[area] ?? "none";

export function can(role: Role, area: Area, need: "view" | "edit" = "view") {
  const l = levelOf(role, area);
  return need === "view" ? l !== "none" : l === "edit";
}
