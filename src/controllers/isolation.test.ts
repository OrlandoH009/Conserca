import { beforeEach, describe, expect, it, vi } from "vitest";

// Aislamiento entre clientes: sin base de datos, con el usuario y los modelos simulados.
const me = { id: 7, name: "Cliente A", role: "usuario" as const };
const auth = vi.hoisted(() => ({ currentUser: vi.fn() }));
const docs = vi.hoisted(() => ({ findWithOwner: vi.fn(), setReview: vi.fn() }));
const projects = vi.hoisted(() => ({ listByClientUser: vi.fn() }));

vi.mock("@/lib/auth", () => ({ ...auth, assertAccess: vi.fn(), requireAccess: vi.fn() }));
vi.mock("@/models/document.model", () => docs);
vi.mock("@/models/project.model", () => projects);
vi.mock("@/models/event.model", () => ({ listByProject: vi.fn().mockResolvedValue([]) }));
vi.mock("@/models/visit.model", () => ({ listByProject: vi.fn().mockResolvedValue([]), observationsFor: vi.fn().mockResolvedValue([]) }));
vi.mock("./activity.controller", () => ({ record: vi.fn(), notifyStaff: vi.fn() }));

const row = (clientUserId: number | null) => ({ doc: { title: "Memoria", filePath: "x.pdf", fileName: "m.pdf" }, clientUserId, ownerId: 1, projectId: 3, projectName: "P" });
const form = (o: Record<string, string>) => Object.entries(o).reduce((fd, [k, v]) => (fd.set(k, v), fd), new FormData());

beforeEach(() => vi.clearAllMocks());

describe("un cliente solo ve lo suyo", () => {
  it("no descarga el PDF de un proyecto de otro cliente", async () => {
    const { fileFor } = await import("./document.controller");
    auth.currentUser.mockResolvedValue(me);
    docs.findWithOwner.mockResolvedValue(row(99));
    expect(await fileFor(1)).toBeNull();
  });
  it("sí descarga el PDF de su propio proyecto", async () => {
    const { fileFor } = await import("./document.controller");
    auth.currentUser.mockResolvedValue(me);
    docs.findWithOwner.mockResolvedValue(row(me.id));
    expect((await fileFor(1))?.name).toBe("m.pdf");
  });
  it("sin sesión no hay descarga", async () => {
    const { fileFor } = await import("./document.controller");
    auth.currentUser.mockResolvedValue(null);
    expect(await fileFor(1)).toBeNull();
  });
  it("no puede aprobar ni comentar un documento de otro cliente", async () => {
    const { review } = await import("./document.controller");
    auth.currentUser.mockResolvedValue(me);
    docs.findWithOwner.mockResolvedValue(row(99));
    await expect(review(form({ id: "1", decision: "aprobado" }))).rejects.toThrow("No encontramos ese documento");
    expect(docs.setReview).not.toHaveBeenCalled();
  });
  it("su lista de proyectos se pide solo con su propio id", async () => {
    const { projectsOf } = await import("./portal.controller");
    projects.listByClientUser.mockResolvedValue([]);
    await projectsOf(me.id);
    expect(projects.listByClientUser).toHaveBeenCalledWith(me.id);
  });
});
