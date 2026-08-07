/**
 * Simple in-memory sliding-window rate limiter.
 * Good for blunt abuse on a single serverless instance; not a global
 * distributed limit. Upgrade to Upstash/Redis later if needed.
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

const MAX_KEYS = 5_000;

function pruneIfNeeded() {
  if (buckets.size <= MAX_KEYS) return;
  const drop = Math.ceil(MAX_KEYS * 0.2);
  let i = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (++i >= drop) break;
  }
}

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): RateLimitResult {
  const now = input.now ?? Date.now();
  const windowStart = now - input.windowMs;
  let bucket = buckets.get(input.key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(input.key, bucket);
    pruneIfNeeded();
  }

  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= input.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldest + input.windowMs - now) / 1000),
    );
    return {
      ok: false,
      limit: input.limit,
      remaining: 0,
      retryAfterSec,
    };
  }

  bucket.timestamps.push(now);
  return {
    ok: true,
    limit: input.limit,
    remaining: Math.max(0, input.limit - bucket.timestamps.length),
    retryAfterSec: 0,
  };
}

export function clientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const vercel = headers.get("x-vercel-forwarded-for");
  if (vercel) {
    const first = vercel.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

/** Match sensitive API routes → limit config. */
export function matchApiRateLimit(
  pathname: string,
  method: string,
): { name: string; limit: number; windowMs: number } | null {
  const m = method.toUpperCase();
  if (m === "POST" && pathname === "/api/rsvp") {
    return { name: "rsvp", limit: 30, windowMs: 60 * 60 * 1000 };
  }
  if (m === "PATCH" && pathname === "/api/rsvp") {
    return { name: "rsvp-update", limit: 60, windowMs: 60 * 60 * 1000 };
  }
  if (m === "POST" && pathname === "/api/waitlist") {
    return { name: "waitlist", limit: 20, windowMs: 60 * 60 * 1000 };
  }
  if (m === "POST" && pathname === "/api/messages") {
    return { name: "messages", limit: 30, windowMs: 60 * 60 * 1000 };
  }
  if (m === "POST" && pathname === "/api/register") {
    return { name: "register", limit: 10, windowMs: 60 * 60 * 1000 };
  }
  if (m === "POST" && pathname === "/api/auth/forgot-password") {
    return { name: "forgot-password", limit: 5, windowMs: 60 * 60 * 1000 };
  }
  if (m === "POST" && pathname === "/api/auth/reset-password") {
    return { name: "reset-password", limit: 10, windowMs: 60 * 60 * 1000 };
  }
  if (m === "POST" && pathname === "/api/upload") {
    return { name: "upload", limit: 40, windowMs: 60 * 60 * 1000 };
  }
  if (m === "POST" && /^\/api\/events\/[^/]+\/unlock$/.test(pathname)) {
    return { name: "unlock", limit: 20, windowMs: 60 * 60 * 1000 };
  }
  if (m === "POST" && /^\/api\/events\/[^/]+\/remind$/.test(pathname)) {
    return { name: "remind", limit: 15, windowMs: 60 * 60 * 1000 };
  }
  if (m === "POST" && pathname === "/api/events") {
    return { name: "create-event", limit: 20, windowMs: 60 * 60 * 1000 };
  }
  if (
    (m === "POST" || m === "DELETE") &&
    (pathname === "/api/guest-book" || pathname === "/api/guest-book/import")
  ) {
    return { name: "guest-book", limit: 60, windowMs: 60 * 60 * 1000 };
  }
  if (
    (m === "POST" || m === "PATCH" || m === "DELETE") &&
    pathname.startsWith("/api/agency/")
  ) {
    return { name: "agency", limit: 40, windowMs: 60 * 60 * 1000 };
  }
  return null;
}
