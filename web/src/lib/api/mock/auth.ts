import type { Session, User } from "@/types/api";
import usersFixture from "./fixtures/users.json";
import { delay, loadCollection, loadObject, saveObject } from "./storage";

const SESSION_KEY = "session";

type StoredSession = { user_id: string; expires_at: string };

function getUsers(): User[] {
  return loadCollection<User>("users", usersFixture as User[]);
}

export async function getSession(): Promise<Session | null> {
  await delay(50);
  const stored = loadObject<StoredSession | null>(SESSION_KEY, null);
  if (!stored) return null;
  const users = getUsers();
  const user = users.find((u) => u.id === stored.user_id);
  if (!user) return null;
  if (new Date(stored.expires_at) < new Date()) return null;
  return { user, expires_at: stored.expires_at };
}

export async function requestMagicLink(email: string): Promise<void> {
  await delay(400);
  // In mock mode, we don't actually send email. The login page writes the
  // magic-link token into a dev banner that auto-signs in.
  const users = getUsers();
  const existing = users.find((u) => u.email === email);
  // We intentionally don't error if user doesn't exist — frontend treats this as
  // "we'll create one on verify if needed" to mirror real magic-link flow.
  void existing;
}

/**
 * In mock mode, calling this just creates a session for the demo user
 * (or the email-matching user). No real token verification.
 */
export async function verifyMagicLink(emailOrToken: string): Promise<Session> {
  await delay(400);
  const users = getUsers();
  // If the argument looks like a token, fall back to the demo user
  let user = users.find((u) => u.email === emailOrToken);
  if (!user) {
    user = users[0]; // demo admin user
  }
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  saveObject<StoredSession>(SESSION_KEY, { user_id: user.id, expires_at });
  return { user, expires_at };
}

export async function logout(): Promise<void> {
  await delay(100);
  saveObject<StoredSession | null>(SESSION_KEY, null);
}
