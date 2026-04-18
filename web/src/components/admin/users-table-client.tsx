"use client";

import * as React from "react";
import type { User } from "@/types/api";
import { listUsers } from "@/lib/api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Dict = {
  col_email: string;
  col_role: string;
  col_org: string;
  col_last: string;
  col_actions: string;
  action_impersonate: string;
  action_deactivate: string;
  loading: string;
};

export function UsersTableClient({ dict }: { dict: Dict }) {
  const [users, setUsers] = React.useState<User[] | null>(null);

  React.useEffect(() => {
    listUsers().then(setUsers);
  }, []);

  if (!users) return <div className="text-sm text-slate-500">{dict.loading}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dict.col_email}</TableHead>
          <TableHead>{dict.col_role}</TableHead>
          <TableHead>{dict.col_org}</TableHead>
          <TableHead>{dict.col_last}</TableHead>
          <TableHead className="text-right">{dict.col_actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell>
              <div className="font-medium">{u.email}</div>
              {u.name && (
                <div className="text-xs text-[var(--muted-foreground)]">{u.name}</div>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={u.role === "admin" ? "accent" : "outline"}>
                {u.role}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-[var(--muted-foreground)]">
              {u.org_id}
            </TableCell>
            <TableCell className="text-sm text-[var(--muted-foreground)]">
              {formatDate(u.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  className="text-[var(--accent)] hover:underline"
                  onClick={() => alert(`Impersonating ${u.email}\n\nThis feature writes a session cookie as ${u.email} and redirects to /dashboard. Available once the real backend is deployed.`)}
                >
                  {dict.action_impersonate}
                </button>
                <button
                  className="text-[var(--danger)] hover:underline"
                  onClick={() => {
                    if (confirm(`Deactivate user ${u.email}? They will no longer be able to sign in.`)) {
                      alert(`User ${u.email} marked for deactivation (mock).\n\nReal implementation will write to the backend on confirm.`);
                    }
                  }}
                >
                  {dict.action_deactivate}
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
