import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors outline-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] shadow-sm",
        secondary:
          "bg-white text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)]",
        ghost: "hover:bg-[var(--muted)] text-[var(--foreground)]",
        destructive: "bg-[var(--danger)] text-white hover:bg-red-700",
        link: "text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-sm rounded-[var(--radius)]",
        lg: "h-12 px-6 text-base rounded-[var(--radius)]",
        icon: "h-10 w-10 rounded-[var(--radius)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
