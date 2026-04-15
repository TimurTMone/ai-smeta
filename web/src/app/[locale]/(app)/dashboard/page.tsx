import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getServerSession } from "@/lib/auth/server";
import { DashboardContent } from "@/components/projects/dashboard-content";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const session = await getServerSession();

  // Pick greeting by time-of-day on the server (no hydration mismatch)
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? dict.app.dashboard.greeting_morning
      : hour < 18
        ? dict.app.dashboard.greeting_afternoon
        : dict.app.dashboard.greeting_evening;

  return (
    <DashboardContent
      locale={locale}
      greeting={greeting}
      userName={session?.email ?? ""}
      dict={{
        recent_projects: dict.app.dashboard.recent_projects,
        empty_title: dict.app.dashboard.empty_title,
        empty_body: dict.app.dashboard.empty_body,
        new_smeta: dict.app.dashboard.new_smeta,
        new_deck: dict.app.dashboard.new_deck,
        loading: dict.common.loading,
      }}
    />
  );
}
