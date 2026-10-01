import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition duration-150 ease-standard active:scale-[0.97] disabled:pointer-events-none disabled:bg-surface-muted disabled:text-border-strong",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-hover",
        dark: "bg-foreground text-on-inverse hover:bg-foreground-secondary",
        outline: "border border-foreground hover:bg-surface-muted",
        light: "bg-surface text-foreground hover:bg-surface-muted",
        ghost: "hover:bg-surface-muted",
        glass:
          "border border-white/25 bg-white/15 text-on-inverse backdrop-blur-md hover:bg-white/25",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-12 px-5.5 text-body",
        lg: "h-14 px-7 text-ui",
        icon: "size-10",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a Link) with button styling instead of a <button>. */
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
