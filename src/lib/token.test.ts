import { beforeAll, describe, expect, it } from "vitest";
import { cookieOptions, readToken, REMEMBER_DAYS, SESSION_HOURS, signToken } from "./token";

beforeAll(() => {
  process.env.SESSION_SECRET = "x".repeat(32);
});

describe("duración de la sesión", () => {
  it("sin Recuérdame: vence a las 12 horas y la cookie es de sesión (se borra al cerrar el navegador)", async () => {
    const s = await readToken(await signToken(7));
    expect(s).toMatchObject({ uid: 7, remember: false });
    expect(s!.exp * 1000 - Date.now()).toBeLessThanOrEqual(SESSION_HOURS * 3_600_000);
    expect(s!.exp * 1000 - Date.now()).toBeGreaterThan((SESSION_HOURS - 1) * 3_600_000);
    expect(cookieOptions(false)).not.toHaveProperty("maxAge");
  });
  it("con Recuérdame: dura 400 días y la cookie se guarda", async () => {
    const s = await readToken(await signToken(7, true));
    expect(s).toMatchObject({ uid: 7, remember: true });
    expect(s!.exp * 1000 - Date.now()).toBeGreaterThan((REMEMBER_DAYS - 1) * 86_400_000);
    expect(cookieOptions(true).maxAge).toBe(REMEMBER_DAYS * 86400);
  });
  it("rechaza un token alterado", async () => {
    expect(await readToken((await signToken(7)) + "x")).toBeNull();
  });
});
