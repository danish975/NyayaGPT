/**
 * HMAC signing helpers built on Web Crypto, so the same code runs in
 * route handlers and in middleware.
 */

const enc = new TextEncoder();

const DEV_SECRET = "nyayagpt-dev-only-insecure-secret-do-not-use-in-prod";

/**
 * Returns the server signing secret, or null if it is not configured.
 * In development a fixed fallback is used so the app works out of the box;
 * in production SESSION_SECRET must be set and at least 32 characters long.
 */
export function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  const isProd = process.env.NODE_ENV === "production";
  if (secret) {
    if (isProd && secret.length < 32) {
      console.error("SESSION_SECRET must be at least 32 characters in production.");
      return null;
    }
    return secret;
  }
  if (isProd) {
    console.error("SESSION_SECRET is not set.");
    return null;
  }
  return DEV_SECRET;
}

export function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): Uint8Array<ArrayBuffer> | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

function importKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function hmacSign(data: string, secret: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await importKey(secret), enc.encode(data));
  return toBase64Url(new Uint8Array(sig));
}

/** Constant-time verification (done by Web Crypto). */
export async function hmacVerify(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const sig = fromBase64Url(signature);
  if (!sig) return false;
  return crypto.subtle.verify("HMAC", await importKey(secret), sig, enc.encode(data));
}
