import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default async function AdminTemplatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  // Stub: hardcode the one template that exists
  const templates = [
    {
      slug: "crystal_diving",
      name: "Crystal Diving",
      description:
        "Cream + navy + gold, Kyrgyz ornamental borders, gold takeaway footer bars. Matches the winning governor pitch deck style.",
      path: "backend/app/deck/templates/crystal_diving.html.j2",
      active: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">
        {dict.admin.nav.templates}
      </h1>
      <div className="grid gap-4">
        {templates.map((t) => (
          <Card key={t.slug}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[var(--radius)] bg-amber-50 text-amber-700 grid place-items-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle>{t.name}</CardTitle>
                    {t.active && <Badge variant="success">active</Badge>}
                  </div>
                  <CardDescription className="mt-1">
                    {t.description}
                  </CardDescription>
                  <code className="mt-3 inline-block text-xs font-mono text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded">
                    {t.path}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
