import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Database,
  Activity,
  FileText,
  ScrollText,
  ArrowLeft,
  FolderKanban,
} from "lucide-react";

export function AdminSidebar({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const items = [
    {
      href: `/${locale}/admin`,
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: dict.admin.nav.overview,
    },
    {
      href: `/${locale}/admin/users`,
      icon: <Users className="w-4 h-4" />,
      label: dict.admin.nav.users,
    },
    {
      href: `/${locale}/admin/projects`,
      icon: <FolderKanban className="w-4 h-4" />,
      label: dict.admin.nav.projects,
    },
    {
      href: `/${locale}/admin/rates`,
      icon: <Database className="w-4 h-4" />,
      label: dict.admin.nav.rates,
    },
    {
      href: `/${locale}/admin/jobs`,
      icon: <Activity className="w-4 h-4" />,
      label: dict.admin.nav.jobs,
    },
    {
      href: `/${locale}/admin/templates`,
      icon: <FileText className="w-4 h-4" />,
      label: dict.admin.nav.templates,
    },
    {
      href: `/${locale}/admin/logs`,
      icon: <ScrollText className="w-4 h-4" />,
      label: dict.admin.nav.logs,
    },
  ];

  return (
    <aside className="w-60 border-r border-[var(--border)] bg-slate-900 text-white flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="w-7 h-7 rounded-md bg-[var(--accent)] text-white grid place-items-center text-sm">
            ◆
          </span>
          Ai-Smeta
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent)] text-white ml-1">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm font-medium",
              "text-slate-200 hover:bg-slate-800 hover:text-white transition-colors",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {dict.nav.dashboard}
        </Link>
      </div>
    </aside>
  );
}
