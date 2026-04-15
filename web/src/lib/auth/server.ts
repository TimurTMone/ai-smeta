/**
 * Server-side session helpers — read/write the session cookie from
 * Server Components, route handlers, and layouts.
 */

import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_DAYS, signSession, verifySession, type SessionClaims } from "./jwt";
import type { Session, User } from "@/types/user";

export async function getServerSession(): Promise<SessionClaims | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setServerSession(user: User): Promise<void> {
  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role,
    org_id: user.org_id,
    locale: user.locale,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * SESSION_TTL_DAYS,
    path: "/",
  });
}

export async function clearServerSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * For components that only need the minimal `{ user, expires_at }` shape
 * without hitting the DB. In mock mode, this just rehydrates from the claims.
 */
export async function readSessionLite(): Promise<Session | null> {
  const claims = await getServerSession();
  if (!claims) return null;
  return {
    user: {
      id: claims.sub,
      email: claims.email,
      name: null,
      locale: claims.locale,
      role: claims.role,
      org_id: claims.org_id,
      created_at: "",
    },
    expires_at: new Date((claims.exp ?? 0) * 1000).toISOString(),
  };
}
