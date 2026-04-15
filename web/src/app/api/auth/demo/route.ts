/**
 * Demo sign-in route — one-click auth for the public demo.
 *
 * No email, no magic link. Creates a session cookie for the first user
 * in the fixtures (the admin demo user) and redirects to /dashboard.
 *
 * This route is intentionally always-on — it's how visitors try the
 * product without signing up. When you ship to production with a real
 * backend, you can either keep it (good for a "Try demo" button) or
 * disable it behind an env var.
 */

import { NextResponse } from "next/server";
import { setServerSession } from "@/lib/auth/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import type { User } from "@/types/user";
import usersFixture from "@/lib/api/mock/fixtures/users.json";

async function signInDemo(request: Request, locale: string): Promise<Response> {
  const users = usersFixture as User[];
  // First user is the admin demo user (see fixtures/users.json)
  const user = users[0];

  // Honor the requested locale if valid
  const effectiveLocale = isLocale(locale) ? locale : defaultLocale;
  const userWithLocale: User = { ...user, locale: effectiveLocale };

  await setServerSession(userWithLocale);
  return NextResponse.redirect(
    new URL(`/${effectiveLocale}/dashboard`, request.url),
    303,
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? defaultLocale;
  return signInDemo(request, locale);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? defaultLocale;
  return signInDemo(request, locale);
}
