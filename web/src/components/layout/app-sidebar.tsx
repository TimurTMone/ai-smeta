import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { UserRole } from "@/types/user";
import { LayoutDashboard, FolderKanban, Settings, Shield, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
};

export function AppSidebar({
  locale,
  role,
  dict,
}: {
  locale: Locale;
  role: UserRole;
  dict: Dictionary;
}) {
  const items: NavItem[] = [
    { href: `/${locale}/dashboard`, icon: <LayoutDashboard className="w-4 h-4" />, label: dict.nav.dashboard },
    { href: `/${locale}/projects`, icon: <FolderKanban className="w-4 h-4" />, label: dict.nav.projects },
    { href: `/${locale}/settings`, icon: <Settings className="w-4 h-4" />, label: dict.nav.settings },
    { href: `/${locale}/admin`, icon: <Shield className="w-4 h-4" />, label: dict.nav.admin, adminOnly: true },
  ];

  return (
    <aside className="w-60 border-r border-[var(--border)] bg-white flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="w-7 h-7 rounded-md bg-[var(--accent)] text-white grid place-items-center text-sm">
            ◆
          </span>
          Ai-Smeta
          <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wider">Beta</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items
          .filter((item) => !item.adminOnly || role === "admin")
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm font-medium",
                "text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--muted-foreground)]">
          <FileText className="w-3.5 h-3.5" />
          <span>Ai-Smeta v0.1 · Beta</span>
        </div>
      </div>
    </aside>
  );
}
