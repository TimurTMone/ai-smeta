import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Button } from "@/components/ui/button";
import { ProjectsListClient } from "@/components/projects/projects-list-client";
import { Plus } from "lucide-react";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {dict.app.projects.title}
        </h1>
        <Link href={`/${locale}/projects/new`}>
          <Button>
            <Plus className="w-4 h-4" />
            {dict.app.projects.new}
          </Button>
        </Link>
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
