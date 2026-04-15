import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-12 pb-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-[var(--muted)] grid place-items-center text-[var(--muted-foreground)] mb-4">
          <Inbox className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
        {body && (
          <p className="mt-1 text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
            {body}
          </p>
        )}
        {children && <div className="mt-5 flex items-center justify-center">{children}</div>}
      </CardContent>
    </Card>
  );
}
