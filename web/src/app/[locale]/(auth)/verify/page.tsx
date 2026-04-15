import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Mail } from "lucide-react";

export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { email } = await searchParams;
  const dict = await getDictionary(locale);

  return (
    <div className="w-full max-w-md">
      <div className="bg-[var(--card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border)] p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-sky-50 text-[var(--accent)] grid place-items-center mb-5">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          {dict.auth.verify.title}
        </h1>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          {dict.auth.verify.subtitle.replace("{email}", email ?? "your email")}
        </p>
        <div className="mt-6">
          <Link
            href={`/${locale}/login`}
            className="text-sm text-[var(--accent)] font-medium hover:underline"
          >
            {dict.auth.verify.try_again}
          </Link>
        </div>
      </div>
    </div>
  );
}
