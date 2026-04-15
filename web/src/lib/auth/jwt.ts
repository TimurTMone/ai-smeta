/**
 * JWT helpers — sign + verify session tokens via jose.
 *
 * Two token types:
 *   - Magic link token: 15 min TTL, single-use (sent in email, verified on click)
 *   - Session token:    30 day TTL, stored in httpOnly cookie
 *
 * Both use the same HS256 secret from env, but have different claims.
 * Pattern matches yurtah-ai/src/lib/auth.ts (adapted for email magic link).
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { Locale } from "@/i18n/config";
import type { UserRole } from "@/types/user";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "aismeta-dev-secret-change-in-production",
);

export const SESSION_COOKIE = "aismeta-session";
export const SESSION_TTL_DAYS = 30;
export const MAGIC_LINK_TTL_MINUTES = 15;

export type SessionClaims = {
  sub: string; // user id
  email: string;
  role: UserRole;
  org_id: string;
  locale: Locale;
} & JWTPayload;

export type MagicLinkClaims = {
  sub: string; // email
  kind: "magic_link";
} & JWTPayload;

export async function signSession(claims: Omit<SessionClaims, "iat" | "exp">): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionClaims;
  } catch {
    return null;
  }
}

export async function signMagicLink(email: string): Promise<string> {
  return new SignJWT({ sub: email, kind: "magic_link" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAGIC_LINK_TTL_MINUTES}m`)
    .sign(JWT_SECRET);
}

export async function verifyMagicLinkToken(token: string): Promise<MagicLinkClaims | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.kind !== "magic_link") return null;
    return payload as MagicLinkClaims;
  } catch {
    return null;
  }
}
