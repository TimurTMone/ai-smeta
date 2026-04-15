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

        {/* One-click demo access — no email required */}
        <a
          href={`/api/auth/demo?locale=${locale}`}
          className="mt-6 flex items-center justify-center w-full h-12 rounded-[var(--radius)] bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          {locale === "en"
            ? "Try the demo → no sign-up needed"
            : locale === "ky"
              ? "Демону сынап көрүү → катталуу керек эмес"
              : "Войти в демо → без регистрации"}
        </a>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
            {locale === "en"
              ? "or sign in with email"
              : locale === "ky"
                ? "же email менен"
                : "или войти по email"}
          </div>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <div>
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
