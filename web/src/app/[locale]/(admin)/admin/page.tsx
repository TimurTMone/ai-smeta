import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { AdminOverviewClient } from "@/components/admin/admin-overview-client";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">
        {dict.admin.nav.overview}
      </h1>
      <AdminOverviewClient dict={{ loading: dict.common.loading }} />
    </div>
  );
}
