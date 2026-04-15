import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { JobsTableClient } from "@/components/admin/jobs-table-client";

export default async function AdminJobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">
        {dict.admin.nav.jobs}
      </h1>
      <JobsTableClient dict={{ loading: dict.common.loading }} />
    </div>
  );
}
