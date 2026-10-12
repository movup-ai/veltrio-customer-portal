import { useTranslations } from "next-intl";
import {
  policyLines,
  type CancellationPolicy as Policy,
  type PolicyWords,
} from "@/shared/lib/cancellation-policy";
import { cn } from "@/shared/lib/cn";

interface CancellationPolicyProps {
  policy: Policy;
  /** Whose policy it is, so a renter knows who to ask. */
  companyName: string;
  className?: string;
}

/** What a renter gets back if the booking is cancelled, shown before they commit or pay. */
export function CancellationPolicy({
  policy,
  companyName,
  className,
}: CancellationPolicyProps) {
  const t = useTranslations("common.policy");
  const words: PolicyWords = {
    anyTime: t("anyTime"),
    atLeast: (count) => t("atLeast", { count }),
    lessThan: (count) => t("lessThan", { count }),
    exactly: (count) => t("exactly", { count }),
    between: (from, to) => t("between", { from, to }),
    noRefund: t("noRefund"),
    refund: (percent) => t("refund", { percent }),
  };
  return (
    <section
      aria-label={t("title")}
      className={cn(
        "rounded-xl border border-border bg-surface p-5 text-sm",
        className,
      )}
    >
      <h2 className="type-label text-muted">{t("title")}</h2>
      <dl className="mt-3 grid gap-2">
        {policyLines(policy, words).map((line) => (
          <div
            key={line.notice}
            className="flex items-baseline justify-between gap-4"
          >
            <dt>{line.notice}</dt>
            <dd
              className={cn(
                "shrink-0 font-semibold",
                line.refundPercent === 100 && "text-success",
                line.refundPercent === 0 && "font-medium text-muted",
              )}
            >
              {line.refund}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-meta text-pretty text-muted">
        {t("footnote", { company: companyName })}
      </p>
    </section>
  );
}
