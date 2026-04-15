import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-lg font-bold">
            <span className="w-7 h-7 rounded-md bg-[var(--accent)] text-white grid place-items-center text-sm">◆</span>
            Ai-Smeta
          </Link>
          <Link href={`/${locale}/login`}>
            <Button size="sm">{dict.nav.signup}</Button>
          </Link>
        </div>
      </header>
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">
          {dict.marketing.pricing.title}
        </h1>
        <p className="mt-6 text-lg text-[var(--muted-foreground)] leading-relaxed">
          {dict.marketing.pricing.subtitle}
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <a href="mailto:timur.mone@gmail.com">
            <Button size="lg">{dict.marketing.pricing.contact}</Button>
          </a>
          <Link href={`/${locale}`}>
            <Button size="lg" variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              {dict.common.back}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
