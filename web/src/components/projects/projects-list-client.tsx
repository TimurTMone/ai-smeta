"use client";

import * as React from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Project, ProjectKind } from "@/types/api";
import { listProjects } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";

type Dict = {
  search_placeholder: string;
  filter_all: string;
  filter_smeta: string;
  filter_deck: string;
  empty_title: string;
  empty_body: string;
  loading: string;
  new: string;
};

type Filter = "all" | ProjectKind;

export function ProjectsListClient({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  const [projects, setProjects] = React.useState<Project[] | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    listProjects().then(setProjects);
  }, []);

  const filtered = React.useMemo(() => {
    if (!projects) return [];
    let list = projects;
    if (filter !== "all") list = list.filter((p) => p.kind === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [projects, filter, query]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: dict.filter_all },
    { key: "smeta", label: dict.filter_smeta },
    { key: "deck", label: dict.filter_deck },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-white rounded-[var(--radius)] border border-[var(--border)]">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                filter === f.key
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.search_placeholder}
          className="max-w-xs"
        />
      </div>

      {projects === null ? (
        <div className="text-sm text-[var(--muted-foreground)]">{dict.loading}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title={dict.empty_title} body={dict.empty_body}>
          <Link href={`/${locale}/projects/new`}>
            <Button>{dict.new}</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
