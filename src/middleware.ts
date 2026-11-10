import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/session";

// First line of defence for the admin area. Every admin API route also checks
// the session itself (lib/admin/guard.ts), so this is not the only gate.

// Logout stays public so it can always clear a stale cookie.
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  if (await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const login = request.nextUrl.clone();
  login.pathname = "/admin/login";
  login.search = "";
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
