"use client";

import * as React from "react";
import { listUsers, listProjects, listRates, listJobs } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FolderKanban, Database, Activity } from "lucide-react";

type Stat = {
  key: string;
  label: string;
  value: number;
  icon: React.ReactNode;
};

export function AdminOverviewClient({ dict }: { dict: { loading: string } }) {
  const [stats, setStats] = React.useState<Stat[] | null>(null);

  React.useEffect(() => {
    (async () => {
      const [users, projects, rates, jobs] = await Promise.all([
        listUsers(),
        listProjects(),
        listRates(),
        listJobs(),
      ]);
      setStats([
        {
          key: "users",
          label: "Пользователи",
          value: users.length,
          icon: <Users className="w-5 h-5" />,
        },
        {
          key: "projects",
          label: "Проекты",
          value: projects.length,
          icon: <FolderKanban className="w-5 h-5" />,
        },
        {
          key: "rates",
          label: "Ставки в базе",
          value: rates.length,
          icon: <Database className="w-5 h-5" />,
        },
        {
          key: "jobs",
          label: "Задач в очереди",
          value: jobs.filter((j) => j.status === "running" || j.status === "queued").length,
          icon: <Activity className="w-5 h-5" />,
        },
      ]);
    })();
  }, []);

  if (!stats) {
    return <div className="text-sm text-slate-500">{dict.loading}</div>;
  }

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.key}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-[var(--radius)] bg-sky-50 text-[var(--accent)] grid place-items-center">
                {s.icon}
              </div>
            </div>
            <div className="text-3xl font-extrabold font-variant-numeric">
              {s.value}
            </div>
            <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold mt-1">
              {s.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
