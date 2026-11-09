import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/admin/guard";
import { clearAttempts, lockedOutFor, recordFailure } from "@/lib/admin/rateLimit";
import { clientKey } from "@/lib/rateLimit";
import { ADMIN_COOKIE, createSessionToken, isAdminConfigured, SESSION_TTL_SECONDS } from "@/lib/admin/session";

const MAX_PASSWORD_LENGTH = 1024;
const MAX_LOGGED_KEY_LENGTH = 64;
const bodySchema = z.object({ password: z.string().min(1).max(MAX_PASSWORD_LENGTH) });

// Hash both sides first so the comparison is constant-time whatever the lengths.
function passwordsMatch(given: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(given), digest(expected));
}

/** Lets the login page say whether admin is switched on. */
export async function GET() {
  return NextResponse.json({ configured: isAdminConfigured() });
}

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!isAdminConfigured() || !expected) return NextResponse.json({ error: "Admin is not set up on this server." }, { status: 503 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request blocked." }, { status: 403 });

  const key = clientKey(request);
  const waitSeconds = lockedOutFor(key);
  if (waitSeconds !== null) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(waitSeconds / 60)} minute(s).` },
      { status: 429, headers: { "Retry-After": String(waitSeconds) } },
    );
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Enter the admin password." }, { status: 400 });
  if (!passwordsMatch(body.data.password, expected)) {
    recordFailure(key);
    // The key comes from request headers, so quote it to keep it on one log line.
    console.warn(`Failed admin sign-in from ${JSON.stringify(key.slice(0, MAX_LOGGED_KEY_LENGTH))} at ${new Date().toISOString()}`);
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  clearAttempts(key);
  const token = await createSessionToken();
  if (!token) return NextResponse.json({ error: "Admin is not set up on this server." }, { status: 503 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
