import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ currentUser: vi.fn() }));
const quotes = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock("@/lib/auth", () => ({ ...auth, assertAccess: vi.fn(), requireAccess: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ limited: vi.fn().mockResolvedValue(false) }));
vi.mock("@/models/quote.model", () => quotes);
vi.mock("@/models/client.model", () => ({}));
vi.mock("@/models/project.model", () => ({}));
vi.mock("@/models/payment.model", () => ({}));
vi.mock("@/models/notification.model", () => ({}));
vi.mock("./activity.controller", () => ({ record: vi.fn(), notifyStaff: vi.fn() }));

const TEAM = "Las cuentas del equipo no solicitan cotizaciones.";
const quick = () => Object.entries({ name: "Ana Pérez", phone: "70001234", message: "Necesito climatizar una oficina" }).reduce((fd, [k, v]) => (fd.set(k, v), fd), new FormData());

beforeEach(() => vi.clearAllMocks());

describe("las cuentas del equipo no cotizan", () => {
  for (const role of ["admin", "ingenieria", "dibujo"] as const) {
    it(`${role}: ni la cotización personalizada ni la rápida`, async () => {
      const { submitPublic, submitQuick } = await import("./quote.controller");
      auth.currentUser.mockResolvedValue({ id: 1, name: "Equipo", email: "e@x.test", phone: null, role });
      expect((await submitPublic(new FormData())).error).toBe(TEAM);
      expect((await submitQuick(quick())).error).toBe(TEAM);
      expect(quotes.create).not.toHaveBeenCalled();
    });
  }
  it("un visitante sin cuenta sí puede enviar la cotización rápida", async () => {
    const { submitQuick } = await import("./quote.controller");
    auth.currentUser.mockResolvedValue(null);
    expect((await submitQuick(quick())).ok).toBe(true);
    expect(quotes.create).toHaveBeenCalledOnce();
  });
});
