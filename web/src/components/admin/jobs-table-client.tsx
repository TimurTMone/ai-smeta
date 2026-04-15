"use client";

import * as React from "react";
import type { Job } from "@/types/api";
import { listJobs } from "@/lib/api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

export function JobsTableClient({ dict }: { dict: { loading: string } }) {
  const [jobs, setJobs] = React.useState<Job[] | null>(null);

  React.useEffect(() => {
    listJobs().then(setJobs);
  }, []);

  if (!jobs) return <div className="text-sm text-slate-500">{dict.loading}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Kind</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((j) => (
          <TableRow key={j.id}>
            <TableCell className="font-mono text-xs">{j.id}</TableCell>
            <TableCell className="text-sm">{j.kind}</TableCell>
            <TableCell>
              <Badge
                variant={
                  j.status === "completed"
                    ? "success"
                    : j.status === "running"
                      ? "warning"
                      : j.status === "failed"
                        ? "danger"
                        : "outline"
                }
              >
                {j.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all"
                    style={{ width: `${j.progress}%` }}
                  />
                </div>
                <span className="text-xs font-variant-numeric text-[var(--muted-foreground)]">
                  {j.progress}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-sm text-[var(--muted-foreground)]">
              {formatRelativeTime(j.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
