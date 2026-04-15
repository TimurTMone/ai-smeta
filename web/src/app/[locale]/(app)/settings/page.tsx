import { notFound } from "next/navigation";
import { isLocale, locales, localeNames } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getServerSession } from "@/lib/auth/server";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const session = await getServerSession();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">
        {dict.app.settings.title}
      </h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <CardTitle>{dict.app.settings.profile}</CardTitle>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
              Email
            </div>
            <div className="text-sm font-medium">{session?.email}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
              {dict.app.settings.organization}
            </div>
            <div className="text-sm font-medium">{session?.org_id}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
              Role
            </div>
            <Badge variant={session?.role === "admin" ? "accent" : "outline"}>
              {session?.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <CardTitle>{dict.app.settings.language}</CardTitle>
          <div className="flex items-center gap-2">
            {locales.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}/settings`}
                className={`px-4 py-2 rounded-[var(--radius)] text-sm font-medium border ${
                  loc === locale
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-white text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                {localeNames[loc]}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <CardTitle>{dict.app.settings.billing}</CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            {dict.app.settings.billing_stub}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
