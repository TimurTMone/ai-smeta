import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 text-sm",
        "text-[var(--foreground)]",
        "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
