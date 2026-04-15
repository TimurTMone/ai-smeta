import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ProjectsListClient } from "@/components/projects/projects-list-client";

export default async function AdminProjectsPage({
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
          {dict.admin.nav.projects}
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)] text-sm">
          All projects across all organizations.
        </p>
      </div>
      <ProjectsListClient
        locale={locale}
        dict={{
          search_placeholder: dict.app.projects.search_placeholder,
          filter_all: dict.app.projects.filter_all,
          filter_smeta: dict.app.projects.filter_smeta,
          filter_deck: dict.app.projects.filter_deck,
          empty_title: dict.app.projects.empty_title,
          empty_body: dict.app.projects.empty_body,
          loading: dict.common.loading,
          new: dict.app.projects.new,
        }}
      />
    </div>
  );
}
