import type { Session } from "@/types/api";
import { apiFetch } from "./client";

export async function getSession(): Promise<Session | null> {
  try {
    return await apiFetch<Session>("/api/auth/session");
  } catch {
    return null;
  }
}

export async function requestMagicLink(email: string): Promise<void> {
  await apiFetch<void>("/api/auth/request-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyMagicLink(token: string): Promise<Session> {
  return apiFetch<Session>(
    `/api/auth/verify?token=${encodeURIComponent(token)}`,
  );
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", { method: "POST" });
}
