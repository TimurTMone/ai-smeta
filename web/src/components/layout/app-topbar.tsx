import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { localeNames, locales } from "@/i18n/config";

export function AppTopbar({
  locale,
  email,
  dict,
}: {
  locale: Locale;
  email: string;
  dict: Dictionary;
}) {
  return (
    <header className="h-16 bg-white border-b border-[var(--border)] flex items-center justify-between px-8 sticky top-0 z-10">
      <div />
      <div className="flex items-center gap-4">
        {/* Language switcher — simple text links (no dropdown for v1) */}
        <div className="hidden md:flex items-center gap-1 text-xs">
          {locales.map((loc) => (
            <Link
              key={loc}
              href={`/${loc}/dashboard`}
              className={`px-2 py-1 rounded ${
                loc === locale
                  ? "bg-[var(--muted)] text-[var(--foreground)] font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {localeNames[loc]}
            </Link>
          ))}
        </div>

        <div className="h-6 w-px bg-[var(--border)] hidden md:block" />

        {/* User menu (simple email + logout for v1) */}
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <div className="font-medium text-[var(--foreground)]">{email}</div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--danger)] transition-colors"
            >
              {dict.nav.logout}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
