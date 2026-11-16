import { NextResponse, type NextRequest } from "next/server";
import { getSecret } from "@/lib/crypto";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Guards /admin on the server: the request must carry a valid, unexpired,
 * HMAC-signed session cookie issued by /api/auth/login.
 */
export async function middleware(request: NextRequest) {
  const secret = getSecret();
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (secret && (await verifySessionToken(token, secret))) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Node.js runtime so SESSION_SECRET is read from the real process env at runtime.
  runtime: "nodejs",
  matcher: ["/admin", "/admin/:path*"],
};
