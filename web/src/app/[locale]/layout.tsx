import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { DictionaryProvider } from "@/lib/i18n-context";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <DictionaryProvider locale={locale} dictionary={dict}>
      {children}
    </DictionaryProvider>
  );
}

export function generateStaticParams() {
  return [{ locale: "ky" }, { locale: "ru" }, { locale: "en" }];
}
