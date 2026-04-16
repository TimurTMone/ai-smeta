import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales, localeNames } from "@/i18n/config";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Sparkles,
  Database,
  Globe,
  Play,
  Zap,
  Ship,
  Languages,
} from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen overflow-hidden">
      {/* ============================================================
          HEADER — frosted glass + language switcher
          ============================================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="backdrop-blur-xl bg-white/70 supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--foreground)] group"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white grid place-items-center text-sm shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-shadow">
                ◆
              </span>
              <span>Ai-Smeta</span>
              <span className="ml-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">Beta</span>
            </Link>

            {/* Nav + language */}
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href={`/${locale}/demo`}
                className="hidden sm:inline-flex px-3 py-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/[0.04] transition-all"
              >
                {dict.nav.demo}
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="hidden sm:inline-flex px-3 py-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/[0.04] transition-all"
              >
                {dict.nav.pricing}
              </Link>

              {/* Language switcher */}
              <div className="flex items-center ml-1 p-0.5 rounded-lg bg-black/[0.04]">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}`}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      loc === locale
                        ? "bg-white text-[var(--foreground)] shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {localeNames[loc]}
                  </Link>
                ))}
              </div>

              <div className="w-px h-5 bg-[var(--border)] mx-2 hidden sm:block" />

              <Link href={`/${locale}/login`} className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm">
                  {dict.nav.login}
                </Button>
              </Link>
              <a href={`/api/auth/demo?locale=${locale}`}>
                <Button size="sm" className="shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-shadow">
                  {dict.nav.signup}
                </Button>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO — gradient mesh background + floating preview
          ============================================================ */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_-10%,hsl(205_100%_95%),transparent),radial-gradient(ellipse_50%_40%_at_75%_0%,hsl(220_100%_96%),transparent),radial-gradient(ellipse_80%_50%_at_50%_100%,hsl(205_100%_97%),transparent)]" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-8 shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              {dict.marketing.hero.eyebrow}
            </div>

            {/* Title with gradient accent */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-[var(--foreground)]">
              {dict.marketing.hero.title}
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto">
              {dict.marketing.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={`/api/auth/demo?locale=${locale}`}>
                <Button
                  size="lg"
                  className="text-base px-8 h-13 shadow-xl shadow-sky-500/20 hover:shadow-sky-500/30 transition-all hover:-translate-y-0.5"
                >
                  {dict.marketing.hero.cta_primary}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
              <Link href={`/${locale}/demo`}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-8 h-13 hover:-translate-y-0.5 transition-all"
                >
                  <Play className="w-4 h-4" />
                  {dict.marketing.hero.cta_secondary}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            {[
              { value: dict.marketing.stats.speed, label: dict.marketing.stats.speed_label, icon: <Zap className="w-4 h-4" /> },
              { value: dict.marketing.stats.projects, label: dict.marketing.stats.projects_label, icon: <Ship className="w-4 h-4" /> },
              { value: dict.marketing.stats.languages, label: dict.marketing.stats.languages_label, icon: <Languages className="w-4 h-4" /> },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 grid place-items-center text-sky-600">
                  {stat.icon}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Demo preview in a browser frame */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border border-[var(--border)] bg-white shadow-2xl shadow-black/8 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 mx-12">
                  <div className="h-7 rounded-md bg-white border border-[var(--border)] flex items-center px-3 text-xs text-[var(--muted-foreground)] font-mono">
                    ai-smeta.vercel.app
                  </div>
                </div>
              </div>
              {/* Deck preview as a real iframe */}
              <div className="aspect-video bg-slate-900 relative">
                <iframe
                  src="/demo-deck/presentation.html"
                  className="absolute inset-0 w-full h-full border-0"
                  title={dict.marketing.demo_badge}
                  loading="lazy"
                />
                {/* Floating badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur text-white text-xs font-semibold shadow-lg z-10">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  {dict.marketing.demo_badge}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--muted)]/50">
                <p className="text-xs text-[var(--muted-foreground)] text-center">
                  {dict.marketing.demo_subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SOCIAL PROOF BAR
          ============================================================ */}
      <section className="border-y border-[var(--border)] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-medium text-[var(--muted-foreground)]">
            <Globe className="w-4 h-4 text-sky-500" />
            {dict.marketing.social_proof}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES — bento-style cards with hover effects
          ============================================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {dict.marketing.features.title}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: dict.marketing.features.smeta_title,
                body: dict.marketing.features.smeta_body,
                icon: <Sparkles className="w-6 h-6" />,
                gradient: "from-sky-500 to-blue-600",
                glow: "sky",
              },
              {
                title: dict.marketing.features.deck_title,
                body: dict.marketing.features.deck_body,
                icon: <FileText className="w-6 h-6" />,
                gradient: "from-violet-500 to-purple-600",
                glow: "violet",
              },
              {
                title: dict.marketing.features.rates_title,
                body: dict.marketing.features.rates_body,
                icon: <Database className="w-6 h-6" />,
                gradient: "from-amber-500 to-orange-600",
                glow: "amber",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-[var(--border)] bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.06] hover:border-[var(--border-strong)]"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} text-white grid place-items-center mb-6 shadow-lg shadow-${feature.glow}-500/25 group-hover:shadow-${feature.glow}-500/40 transition-shadow`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl mb-3 text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — connected steps
          ============================================================ */}
      <section className="py-24 bg-gradient-to-b from-[var(--muted)] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-16 tracking-tight">
            {dict.marketing.how.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-0 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-sky-200 via-sky-300 to-sky-200 z-0" />

            {[
              { title: dict.marketing.how.step1_title, body: dict.marketing.how.step1_body },
              { title: dict.marketing.how.step2_title, body: dict.marketing.how.step2_body },
              { title: dict.marketing.how.step3_title, body: dict.marketing.how.step3_body },
            ].map((step, i) => (
              <div key={i} className="relative text-center px-6 py-4 group">
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white text-2xl font-extrabold grid place-items-center mx-auto mb-6 shadow-xl shadow-sky-500/25 group-hover:shadow-sky-500/40 group-hover:scale-105 transition-all">
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg mb-2 text-[var(--foreground)]">{step.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs mx-auto">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA — gradient section
          ============================================================ */}
      <section className="py-24 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(14,165,233,0.15),transparent)]" />

        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            {dict.marketing.cta.title}
          </h2>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            {dict.marketing.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={`/api/auth/demo?locale=${locale}`}>
              <Button
                size="lg"
                className="text-base px-8 h-13 bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/10 hover:shadow-white/20 transition-all hover:-translate-y-0.5"
              >
                {dict.marketing.cta.button}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
            <Link href={`/${locale}/demo`}>
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8 h-13 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
              >
                {dict.marketing.hero.cta_secondary}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER — clean, 3-column, language switcher in footer too
          ============================================================ */}
      <footer className="border-t border-[var(--border)] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--foreground)] mb-4"
              >
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white grid place-items-center text-sm shadow-lg shadow-sky-500/20">
                  ◆
                </span>
                Ai-Smeta
              </Link>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs">
                {dict.brand.description}
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                  {locale === "en" ? "Product" : locale === "ky" ? "Продукт" : "Продукт"}
                </h4>
                <div className="space-y-2.5">
                  <Link href={`/${locale}/demo`} className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {dict.nav.demo}
                  </Link>
                  <Link href={`/${locale}/pricing`} className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {dict.nav.pricing}
                  </Link>
                  <a href="https://github.com/TimurTMone/ai-smeta" target="_blank" rel="noreferrer" className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    GitHub
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                  {locale === "en" ? "Account" : locale === "ky" ? "Аккаунт" : "Аккаунт"}
                </h4>
                <div className="space-y-2.5">
                  <Link href={`/${locale}/login`} className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {dict.nav.login}
                  </Link>
                  <a href={`/api/auth/demo?locale=${locale}`} className="block text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {dict.nav.signup}
                  </a>
                </div>
              </div>
            </div>

            {/* Language */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                <Globe className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                {locale === "en" ? "Language" : locale === "ky" ? "Тил" : "Язык"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      loc === locale
                        ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-sky-500/20"
                        : "bg-white text-[var(--foreground)] border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-sm"
                    }`}
                  >
                    {localeNames[loc]}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
            <div>© 2026 Ai-Smeta</div>
            <div>{dict.marketing.social_proof}</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
