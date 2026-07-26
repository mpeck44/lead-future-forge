// Lightweight in-memory rate limiter for edge functions.
// Tradeoff: limits are per-instance and reset on cold starts, so they
// stop runaway client loops but not distributed abuse. Sufficient for
// current threat model per project policy.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  b.count += 1;
  if (b.count > opts.limit) {
    return { allowed: false, retryAfterMs: b.resetAt - now };
  }
  return { allowed: true, retryAfterMs: 0 };
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
