import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileText, Sparkles, Database } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen">
      {/* ===== Marketing header ===== */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="w-7 h-7 rounded-md bg-[var(--accent)] text-white grid place-items-center text-sm">
              ◆
            </span>
            Ai-Smeta
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href={`/${locale}/demo`}
              className="px-3 py-2 hover:text-[var(--accent)] transition-colors text-[var(--muted-foreground)]"
            >
              {dict.nav.demo}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="px-3 py-2 hover:text-[var(--accent)] transition-colors text-[var(--muted-foreground)]"
            >
              {dict.nav.pricing}
            </Link>
            <Link href={`/${locale}/login`} className="ml-2">
              <Button variant="ghost" size="sm">
                {dict.nav.login}
              </Button>
            </Link>
            <Link href={`/${locale}/login`}>
              <Button size="sm">
                {dict.nav.signup}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--accent)] mb-4">
          {dict.marketing.hero.eyebrow}
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--foreground)] max-w-3xl mx-auto leading-[1.05]">
          {dict.marketing.hero.title}
        </h1>
        <p className="mt-6 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
          {dict.marketing.hero.subtitle}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href={`/${locale}/login`}>
            <Button size="lg">
              {dict.marketing.hero.cta_primary}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/${locale}/demo`}>
            <Button size="lg" variant="secondary">
              {dict.marketing.hero.cta_secondary}
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== Feature grid ===== */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {dict.marketing.features.title}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="w-11 h-11 rounded-[var(--radius)] bg-sky-50 text-[var(--accent)] grid place-items-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                {dict.marketing.features.smeta_title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {dict.marketing.features.smeta_body}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="w-11 h-11 rounded-[var(--radius)] bg-sky-50 text-[var(--accent)] grid place-items-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                {dict.marketing.features.deck_title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {dict.marketing.features.deck_body}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="w-11 h-11 rounded-[var(--radius)] bg-sky-50 text-[var(--accent)] grid place-items-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">
                {dict.marketing.features.rates_title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {dict.marketing.features.rates_body}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="max-w-6xl mx-auto px-6 py-16 bg-[var(--muted)] rounded-[var(--radius-lg)] my-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          {dict.marketing.how.title}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: dict.marketing.how.step1_title, body: dict.marketing.how.step1_body },
            { title: dict.marketing.how.step2_title, body: dict.marketing.how.step2_body },
            { title: dict.marketing.how.step3_title, body: dict.marketing.how.step3_body },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white text-xl font-bold grid place-items-center mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight mb-4">
          {dict.marketing.cta.title}
        </h2>
        <p className="text-lg text-[var(--muted-foreground)] mb-8">
          {dict.marketing.cta.subtitle}
        </p>
        <Link href={`/${locale}/login`}>
          <Button size="lg">
            {dict.marketing.cta.button}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-[var(--border)] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-[var(--muted-foreground)] flex flex-wrap items-center justify-between gap-4">
          <div>© 2026 Ai-Smeta</div>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/demo`} className="hover:text-[var(--accent)]">
              {dict.nav.demo}
            </Link>
            <Link href={`/${locale}/pricing`} className="hover:text-[var(--accent)]">
              {dict.nav.pricing}
            </Link>
            <a
              href="https://github.com/TimurTMone/ai-smeta"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--accent)]"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
