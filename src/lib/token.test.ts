import { beforeAll, describe, expect, it } from "vitest";
import { cookieOptions, readLink, readToken, REMEMBER_DAYS, SESSION_HOURS, signLink, signToken } from "./token";

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

describe("enlaces por correo (confirmar correo, cambiar contraseña)", () => {
  it("se leen solo con su mismo propósito", async () => {
    const link = await signLink("verify", { id: 7, v: "ana@x.test" }, "48h");
    expect(await readLink("verify", link)).toEqual({ id: 7, v: "ana@x.test" });
    expect(await readLink("reset", link)).toBeNull();
  });
  it("nunca sirven como cookie de sesión", async () => {
    expect(await readToken(await signLink("reset", { id: 7, v: "huella" }, "1h"))).toBeNull();
  });
  it("una sesión no sirve como enlace", async () => {
    expect(await readLink("reset", await signToken(7))).toBeNull();
  });
  it("vencidos o alterados no sirven", async () => {
    expect(await readLink("verify", await signLink("verify", { id: 7, v: "a" }, "-1s"))).toBeNull();
    expect(await readLink("verify", (await signLink("verify", { id: 7, v: "a" }, "1h")) + "x")).toBeNull();
  });
});
