import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getSecret } from "@/lib/crypto";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/session";
import { enforceRateLimit } from "@/lib/rate-limit";

/** Constant-time string comparison (hashing first hides length differences). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, {
    name: "login",
    perIp: 10,
    global: 100,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  const isProd = process.env.NODE_ENV === "production";
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  // The admin123 fallback exists only for local development.
  const adminPass = process.env.ADMIN_PASSWORD || (isProd ? "" : "admin123");
  const secret = getSecret();

  if (!adminPass || !secret) {
    return NextResponse.json(
      { error: "Admin login is not configured. Set ADMIN_PASSWORD and SESSION_SECRET." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username : "";
    const password = typeof body?.password === "string" ? body.password : "";

    // Evaluate both comparisons so timing doesn't reveal which one failed.
    const userOk = safeEqual(username, adminUser);
    const passOk = safeEqual(password, adminPass);

    if (!(userOk && passOk)) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, role: "admin" });
    response.cookies.set(SESSION_COOKIE, await createSessionToken(adminUser, secret), {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Login failed." },
      { status: 500 }
    );
  }
}
