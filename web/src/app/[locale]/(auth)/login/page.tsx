import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="w-full max-w-md">
      <div className="bg-[var(--card)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border)] p-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
          {dict.auth.login.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {dict.auth.login.subtitle}
        </p>
        <div className="mt-6">
          <LoginForm
            locale={locale}
            labels={{
              email_label: dict.auth.login.email_label,
              email_placeholder: dict.auth.login.email_placeholder,
              submit: dict.auth.login.submit,
              invalid_email: dict.auth.errors.invalid_email,
              unknown_error: dict.auth.errors.unknown,
              dev_banner_title: dict.auth.dev_banner.title,
              dev_banner_body: dict.auth.dev_banner.body,
            }}
          />
        </div>
        <div className="mt-6 text-center">
          <Link
            href={`/${locale}`}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)]"
          >
            ← {dict.auth.login.back_to_home}
          </Link>
        </div>
      </div>
    </div>
  );
}
