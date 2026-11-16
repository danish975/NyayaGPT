import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Simple fixed-window, in-memory rate limiter.
 *
 * This holds state per server process. It is effective for a single Node
 * server or container; on multi-instance / serverless hosting each instance
 * keeps its own counters, so swap in a shared store (e.g. Redis) there.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function hit(key: string, limit: number, windowMs: number): number {
  const now = Date.now();

  if (now - lastSweep > 60_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    lastSweep = now;
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return 0;
  }
  bucket.count += 1;
  return bucket.count > limit ? Math.ceil((bucket.resetAt - now) / 1000) : 0;
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

type Limits = {
  /** Route name used to namespace the counters. */
  name: string;
  /** Max requests per client IP per window. */
  perIp: number;
  /** Max requests across all clients per window (bounds cost even if IPs are spoofed). */
  global: number;
  windowMs: number;
};

/**
 * Returns a 429 response if the request is over a limit, otherwise null.
 */
export function enforceRateLimit(request: NextRequest, limits: Limits): NextResponse | null {
  const ip = clientIp(request);
  const retryAfter = Math.max(
    hit(`${limits.name}:ip:${ip}`, limits.perIp, limits.windowMs),
    hit(`${limits.name}:global`, limits.global, limits.windowMs)
  );
  if (retryAfter === 0) return null;
  return NextResponse.json(
    { error: "Too many requests. Please try again in a moment." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
