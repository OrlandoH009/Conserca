import { jwtVerify, SignJWT } from "jose";

const key = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET debe tener al menos 32 caracteres");
  return new TextEncoder().encode(s);
};

export const SESSION_COOKIE = "session";
export const SESSION_DAYS = 7;

export async function signToken(uid: number) {
  return new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

/** Devuelve el id de usuario si el token es válido y no ha vencido. */
export async function verifyToken(token?: string): Promise<number | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return typeof payload.uid === "number" ? payload.uid : null;
  } catch {
    return null;
  }
}
