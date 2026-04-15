"use client";

import * as React from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Project } from "@/types/api";
import { listProjects } from "@/lib/api";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import { EmptyState } from "./empty-state";
import { FileSpreadsheet, FileText } from "lucide-react";

type Dict = {
  recent_projects: string;
  empty_title: string;
  empty_body: string;
  new_smeta: string;
  new_deck: string;
  loading: string;
};

export function DashboardContent({
  locale,
  greeting,
  userName,
  dict,
}: {
  locale: Locale;
  greeting: string;
  userName: string;
  dict: Dict;
}) {
  const [projects, setProjects] = React.useState<Project[] | null>(null);

  React.useEffect(() => {
    listProjects().then(setProjects);
  }, []);

  const recent = (projects ?? []).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {greeting}, <span className="text-[var(--muted-foreground)] font-medium">{userName}</span>
        </h1>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href={`/${locale}/projects/new?kind=smeta`} className="group">
          <Card className="h-full transition-shadow group-hover:shadow-[var(--shadow-md)]">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[var(--radius)] bg-sky-50 text-[var(--accent)] grid place-items-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="mb-1">{dict.new_smeta}</CardTitle>
                  <CardDescription>
                    {locale === "en"
                      ? "Turn a voice note or text brief into a line-itemed cost estimate."
                      : locale === "ky"
                        ? "Үн же текстти сметалык эсепке айландырыңыз."
                        : "Превратите голосовую заметку или текст в сметный расчёт."}
                  </CardDescription>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">
                  →
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/projects/new?kind=deck`} className="group">
          <Card className="h-full transition-shadow group-hover:shadow-[var(--shadow-md)]">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[var(--radius)] bg-sky-50 text-[var(--accent)] grid place-items-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="mb-1">{dict.new_deck}</CardTitle>
                  <CardDescription>
                    {locale === "en"
                      ? "Generate a 17-slide bilingual investor deck from a brief."
                      : locale === "ky"
                        ? "Долбоорду 17 слайддык эки тилдүү презентацияга айландырыңыз."
                        : "Создайте 17-слайдовую двуязычную инвесторскую презентацию."}
                  </CardDescription>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">
                  →
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{dict.recent_projects}</h2>
          <Link
            href={`/${locale}/projects`}
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            →
          </Link>
        </div>
        {projects === null ? (
          <div className="text-sm text-[var(--muted-foreground)]">{dict.loading}</div>
        ) : recent.length === 0 ? (
          <EmptyState title={dict.empty_title} body={dict.empty_body}>
            <Link href={`/${locale}/projects/new`}>
              <Button>{dict.new_smeta}</Button>
            </Link>
          </EmptyState>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recent.map((p) => (
              <ProjectCard key={p.id} project={p} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
