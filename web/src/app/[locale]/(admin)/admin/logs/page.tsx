import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default async function AdminLogsPage({
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
        {dict.admin.nav.logs}
      </h1>
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--muted)] grid place-items-center text-[var(--muted-foreground)] mb-4">
            <ScrollText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold">
            Audit log — backend endpoint pending
          </h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
            The audit log page reads from `/api/audit` once the backend teammate
            implements it. Schema is already defined in `web/src/types/api.ts`
            (AuditEntry) and `docs/api-contract.md`.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
