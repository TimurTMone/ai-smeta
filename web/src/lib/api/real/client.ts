/**
 * Real API client — fetch wrapper for calling the FastAPI backend.
 *
 * Reads NEXT_PUBLIC_API_BASE_URL from env. Every call carries the session
 * cookie via `credentials: 'include'` so the backend can authenticate.
 *
 * The backend teammate implements the matching FastAPI routes and the
 * frontend flips from mock to real with zero code changes outside of
 * `NEXT_PUBLIC_API_MODE=real`.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `API ${init?.method ?? "GET"} ${path} failed: ${res.status} ${body}`,
    );
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
