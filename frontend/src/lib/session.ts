import { fromBase64Url, hmacSign, hmacVerify, toBase64Url } from "./crypto";

export const SESSION_COOKIE = "nyayagpt-session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

type SessionPayload = { sub: string; exp: number };

/** Token format: base64url(JSON payload) + "." + base64url(HMAC-SHA256). */
export async function createSessionToken(username: string, secret: string): Promise<string> {
  const payload: SessionPayload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${body}.${await hmacSign(body, secret)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  if (!(await hmacVerify(body, sig, secret))) return false;

  const raw = fromBase64Url(body);
  if (!raw) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(raw)) as Partial<SessionPayload>;
    return typeof payload.exp === "number" && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
