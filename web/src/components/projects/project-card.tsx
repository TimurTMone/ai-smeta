import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Project } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const href =
    project.kind === "deck"
      ? `/${locale}/decks/${project.id}`
      : `/${locale}/smeta/${project.id}`;

  const statusVariant =
    project.status === "ready"
      ? "success"
      : project.status === "processing"
        ? "warning"
        : project.status === "error"
          ? "danger"
          : "outline";

  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer">
        {project.preview_image_url ? (
          <div
            className="h-28 bg-cover bg-center rounded-t-[var(--radius-lg)] border-b border-[var(--border)]"
            style={{ backgroundImage: `url(${project.preview_image_url})` }}
          />
        ) : (
          <div className="h-28 bg-gradient-to-br from-sky-50 to-slate-50 rounded-t-[var(--radius-lg)] border-b border-[var(--border)] grid place-items-center">
            {project.kind === "deck" ? (
              <FileText className="w-8 h-8 text-[var(--accent)] opacity-50" />
            ) : (
              <FileSpreadsheet className="w-8 h-8 text-[var(--accent)] opacity-50" />
            )}
          </div>
        )}
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant={statusVariant}>{project.status}</Badge>
            <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">
              {project.kind}
            </span>
          </div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-[var(--foreground)]">
            {project.name}
          </h3>
          <div className="mt-2 text-xs text-[var(--muted-foreground)]">
            {formatRelativeTime(project.updated_at, locale)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
