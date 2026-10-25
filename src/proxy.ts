import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/token";

// Revisión rápida: sin sesión válida no se entra a /app (excepto el login).
// La autorización real ocurre en cada página y acción (lib/auth.ts).
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/app/login") return NextResponse.next();
  const uid = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!uid) return NextResponse.redirect(new URL("/app/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/app/:path*"] };
