import { describe, expect, it, vi } from "vitest";

// Aislamiento entre clientes: sin base de datos, con los modelos simulados.
const projects = vi.hoisted(() => ({ listByClientUser: vi.fn() }));

vi.mock("@/models/project.model", () => projects);
vi.mock("@/models/event.model", () => ({ listByProject: vi.fn().mockResolvedValue([]) }));

describe("un cliente solo ve lo suyo", () => {
  it("su lista de proyectos se pide solo con su propio id", async () => {
    const { projectsOf } = await import("./portal.controller");
    projects.listByClientUser.mockResolvedValue([]);
    await projectsOf(7);
    expect(projects.listByClientUser).toHaveBeenCalledWith(7);
  });
});
