import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdminConfigured, verifySessionToken } from "./session";

/** Same-site check for state-changing requests (blocks cross-site form posts). */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Checks an admin API request. Returns an error response to send back, or
 * null when the caller is a signed-in admin on this site.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  if (!isAdminConfigured()) return NextResponse.json({ error: "Admin is not set up on this server." }, { status: 503 });
  if (!(await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }
  return null;
}
