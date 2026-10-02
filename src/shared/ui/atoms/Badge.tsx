import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

const badgeVariants = cva(
  "inline-flex h-6 items-center gap-1 rounded-full px-3 text-caption font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-surface text-foreground shadow-1",
        inverse: "bg-foreground text-on-inverse",
        success: "bg-success-soft text-success",
        accent: "bg-accent-soft text-primary-hover",
        muted: "bg-surface-muted text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
