import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 text-sm",
        "placeholder:text-[var(--muted-foreground-2)] text-[var(--foreground)]",
        "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors",
        className,
      )}
      {...props}
    />
  );
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-2 text-sm",
        "placeholder:text-[var(--muted-foreground-2)] text-[var(--foreground)]",
        "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors resize-y min-h-[80px]",
        className,
      )}
      {...props}
    />
  );
}
