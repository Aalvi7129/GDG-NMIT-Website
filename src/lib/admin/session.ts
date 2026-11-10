// Admin sessions: a signed, expiring token in an http-only cookie.
// Uses only Web Crypto so it runs in both middleware (edge) and route handlers.

export const ADMIN_COOKIE = "gdg_admin";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;
const MIN_SECRET_LENGTH = 32;
const MIN_PASSWORD_LENGTH = 14;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function sessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null;
}

/** Admin is only switched on when both env vars are set (and the secret is long enough). */
export function isAdminConfigured(): boolean {
  return (process.env.ADMIN_PASSWORD ?? "").length >= MIN_PASSWORD_LENGTH && sessionSecret() !== null;
}

// Signing with secret + password means changing ADMIN_PASSWORD signs everyone out.
function signingKey(): string | null {
  const secret = sessionSecret();
  const password = process.env.ADMIN_PASSWORD;
  return secret && password ? `${secret}\u0000${password}` : null;
}

async function sign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data))));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(now = Date.now()): Promise<string | null> {
  const secret = signingKey();
  if (!secret) return null;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ exp: now + SESSION_TTL_SECONDS * 1000 })));
  return `${payload}.${await sign(secret, payload)}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  const secret = signingKey();
  if (!secret || !token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return false;
  if (!constantTimeEqual(signature, await sign(secret, payload))) return false;
  try {
    const { exp } = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as { exp?: unknown };
    return typeof exp === "number" && exp > now;
  } catch {
    return false; // malformed payload
  }
}
