import { jwtVerify, SignJWT } from "jose";

const key = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET debe tener al menos 32 caracteres");
  return new TextEncoder().encode(s);
};

export const SESSION_COOKIE = "session";
/** Sin "Recuérdame": la sesión dura 12 horas (y la cookie se borra al cerrar el navegador). */
export const SESSION_HOURS = 12;
/** Con "Recuérdame": 400 días, el máximo que los navegadores guardan una cookie. Se renueva al volver, así que en la práctica no vence. */
export const REMEMBER_DAYS = 400;
/** Si a una sesión recordada le quedan menos días que esto, se renueva al entrar. */
export const RENEW_BELOW_DAYS = 365;

export async function signToken(uid: number, remember = false) {
  return new SignJWT({ uid, rem: remember })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(remember ? `${REMEMBER_DAYS}d` : `${SESSION_HOURS}h`)
    .sign(key());
}

/** Datos de la sesión si el token es válido y no ha vencido. */
export async function readToken(token?: string): Promise<{ uid: number; remember: boolean; exp: number } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return typeof payload.uid === "number" ? { uid: payload.uid, remember: payload.rem === true, exp: payload.exp ?? 0 } : null;
  } catch {
    return null;
  }
}

/** Devuelve el id de usuario si el token es válido y no ha vencido. */
export async function verifyToken(token?: string): Promise<number | null> {
  return (await readToken(token))?.uid ?? null;
}

/** Opciones de la cookie: recordada = dura REMEMBER_DAYS; si no, cookie de sesión (sin maxAge: el navegador la borra al cerrarse). */
export const cookieOptions = (remember: boolean) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  ...(remember ? { maxAge: REMEMBER_DAYS * 86400 } : {}),
});
