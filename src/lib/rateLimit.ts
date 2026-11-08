import type { NextRequest } from "next/server";

// Simple in-memory rate limiting (admin sign-in, contact form). Per server
// instance only, so on a multi-instance host it slows abuse rather than
// strictly capping it.

export interface RateLimiter {
  /** Returns seconds to wait if `key` is over the limit, otherwise null (and counts this attempt). */
  take: (key: string, now?: number) => number | null;
  /** Returns seconds to wait if `key` is over the limit, otherwise null. Counts nothing. */
  peek: (key: string, now?: number) => number | null;
  clear: (key: string) => void;
}

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  // Drop expired buckets so the map can't grow without bound.
  const prune = (now: number) => {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  };
  return {
    peek(key, now = Date.now()) {
      prune(now);
      const bucket = buckets.get(key);
      return bucket && bucket.count >= limit ? Math.ceil((bucket.resetAt - now) / 1000) : null;
    },
    take(key, now = Date.now()) {
      prune(now);
      const bucket = buckets.get(key);
      if (!bucket) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return null;
      }
      if (bucket.count >= limit) return Math.ceil((bucket.resetAt - now) / 1000);
      buckets.set(key, { ...bucket, count: bucket.count + 1 });
      return null;
    },
    clear(key) {
      buckets.delete(key);
    },
  };
}

/** Who's asking. Prefers the platform-set x-real-ip; a raw x-forwarded-for can be forged by the caller. */
export function clientKey(request: NextRequest): string {
  return request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
}
