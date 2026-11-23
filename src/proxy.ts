import { NextResponse, type NextRequest } from "next/server";
import { cookieOptions, readToken, RENEW_BELOW_DAYS, SESSION_COOKIE, signToken } from "@/lib/token";

// Revisión rápida, antes de pintar nada: sin sesión válida no se entra a /app (excepto el login, confirmar correo y cambiar contraseña) ni a /mis-proyectos ni a /avisos. /cotizar es público.
// La autorización real ocurre en cada página y acción (lib/auth.ts).
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/app/login" || pathname.startsWith("/app/login/")) return NextResponse.next();
  const s = await readToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!s) return NextResponse.redirect(new URL("/app/login", req.url));
  const res = NextResponse.next();
  // "Recuérdame": al volver se renueva, así la sesión no vence mientras la persona siga entrando.
  if (s.remember && s.exp * 1000 - Date.now() < RENEW_BELOW_DAYS * 86_400_000) res.cookies.set(SESSION_COOKIE, await signToken(s.uid, true), cookieOptions(true));
  return res;
}

export const config = { matcher: ["/app/:path*", "/mis-proyectos", "/avisos"] };
