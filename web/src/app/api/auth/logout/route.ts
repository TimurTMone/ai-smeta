import { NextResponse } from "next/server";
import { clearServerSession } from "@/lib/auth/server";
import { defaultLocale } from "@/i18n/config";

export async function POST(request: Request) {
  await clearServerSession();
  return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url), 303);
}

export async function GET(request: Request) {
  await clearServerSession();
  return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
}
