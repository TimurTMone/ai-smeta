import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { RatesTableClient } from "@/components/admin/rates-table-client";

export default async function AdminRatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {dict.admin.rates.title}
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {dict.admin.rates.subtitle}
        </p>
      </div>
      <RatesTableClient
        locale={locale}
        dict={{
          col_material: dict.admin.rates.col_material,
          col_unit: dict.admin.rates.col_unit,
          col_price: dict.admin.rates.col_price,
          col_region: dict.admin.rates.col_region,
          col_source: dict.admin.rates.col_source,
          col_observed: dict.admin.rates.col_observed,
          loading: dict.common.loading,
        }}
      />
    </div>
  );
}
