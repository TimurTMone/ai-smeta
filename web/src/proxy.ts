import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, type Locale, isLocale } from "./i18n/config";

const LOCALE_COOKIE = "aismeta-locale";

function detectLocale(request: NextRequest): Locale {
  // 1. Cookie
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  // 2. Accept-Language header
  const accept = request.headers.get("accept-language");
  if (accept) {
    const preferred = accept
      .split(",")
      .map((s) => s.split(";")[0].trim().toLowerCase().slice(0, 2))
      .find((code) => (locales as readonly string[]).includes(code));
    if (preferred && isLocale(preferred)) return preferred;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, api, and favicons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/demo-deck")
  ) {
    return NextResponse.next();
  }

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`,
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Redirect with the detected locale
  const locale = detectLocale(request);
  const newUrl = new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|demo-deck|.*\\..*).*)"],
};
