import { NextResponse } from "next/server";
import { verifyMagicLinkToken } from "@/lib/auth/jwt";
import { setServerSession } from "@/lib/auth/server";
import type { User } from "@/types/user";
import usersFixture from "@/lib/api/mock/fixtures/users.json";
import { defaultLocale } from "@/i18n/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const nextParam = url.searchParams.get("next");

  if (!token) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/login?error=missing_token`, request.url));
  }

  const claims = await verifyMagicLinkToken(token);
  if (!claims) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/login?error=invalid_token`, request.url));
  }

  // Find or create a user. In mock mode we use the fixtures file as the
  // "user table" — if the email matches, we sign them in as that user.
  // Otherwise we create an ad-hoc user. The real backend will do this via DB.
  const users = usersFixture as User[];
  const email = claims.sub;
  const existing = users.find((u) => u.email === email);

  const user: User = existing ?? {
    id: "user_" + Math.random().toString(36).slice(2, 10),
    email,
    name: null,
    locale: defaultLocale,
    role: "user",
    org_id: "org_demo",
    created_at: new Date().toISOString(),
  };

  await setServerSession(user);

  const next = nextParam && nextParam.startsWith("/") ? nextParam : `/${user.locale}/dashboard`;
  return NextResponse.redirect(new URL(next, request.url));
}
