// Rate Limiting بسيط في الذاكرة (للإنتاج: استخدم Upstash Redis)
// يحدّ من الطلبات المتكررة لكل IP + مسار
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 60, windowMs = 60_000): { ok: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit) return { ok: false, remaining: 0 };
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

export function rateLimitHeaders(remaining: number) {
  return { "X-RateLimit-Remaining": String(remaining) };
}
