import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-[var(--muted)]">
      <header className="border-b border-[var(--border)] bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-lg font-bold">
            <span className="w-7 h-7 rounded-md bg-[var(--accent)] text-white grid place-items-center text-sm">◆</span>
            Ai-Smeta
          </Link>
          <div className="flex items-center gap-2">
            <a href="/demo-deck/presentation.html" target="_blank" rel="noreferrer">
              <Button size="sm" variant="secondary">
                <ExternalLink className="w-4 h-4" />
                {dict.marketing.demo.open_full}
              </Button>
            </a>
            <a href={`/api/auth/demo?locale=${locale}`}>
              <Button size="sm">{dict.nav.signup}</Button>
            </a>
          </div>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link
            href={`/${locale}`}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> {dict.common.back}
          </Link>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
            {dict.marketing.demo.title}
          </h1>
          <p className="mt-3 text-[var(--muted-foreground)] max-w-2xl">
            {dict.marketing.demo.subtitle}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-md)] overflow-hidden">
          <iframe
            src="/demo-deck/presentation.html"
            className="w-full h-[80vh] border-0"
            title="Ai-Smeta Demo Deck"
          />
        </div>
      </section>
    </main>
  );
}
