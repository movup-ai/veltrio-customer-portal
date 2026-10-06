import { CircleAlert, CircleCheck, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

const TONES = {
  success: { Icon: CircleCheck, className: "bg-success-soft text-success" },
  waiting: { Icon: Clock, className: "bg-surface-muted text-foreground" },
  warning: { Icon: CircleAlert, className: "bg-accent-soft text-primary" },
} as const;

interface PaymentNoticeProps {
  tone: keyof typeof TONES;
  title: string;
  body: string;
  /** Something to do next, e.g. a receipt link. */
  action?: ReactNode;
}

/** Where a payment link stands when there is no form to fill in. */
export function PaymentNotice({
  tone,
  title,
  body,
  action,
}: PaymentNoticeProps) {
  const { Icon, className } = TONES[tone];
  return (
    <div role="status" className="flex flex-col items-center py-2 text-center">
      <span
        className={cn(
          "grid size-12 place-items-center rounded-full",
          className,
        )}
      >
        <Icon aria-hidden className="size-6" strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-h4 font-semibold">{title}</h2>
      <p className="mt-2 max-w-prose text-sm text-pretty text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
