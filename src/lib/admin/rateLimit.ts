import { createRateLimiter } from "@/lib/rateLimit";

// Admin sign-in: 5 wrong passwords per 15 minutes per visitor. Only failures
// count, so signing in successfully never uses up anyone's attempts.

export const LOGIN_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const loginLimiter = createRateLimiter(LOGIN_ATTEMPTS, LOGIN_WINDOW_MS);

/** Returns seconds to wait if `key` is locked out, otherwise null. Counts nothing. */
export const lockedOutFor = (key: string, now?: number) => loginLimiter.peek(key, now);

/** Records one wrong password for `key`. */
export const recordFailure = (key: string, now?: number) => {
  loginLimiter.take(key, now);
};

export const clearAttempts = (key: string) => loginLimiter.clear(key);
