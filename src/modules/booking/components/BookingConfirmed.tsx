import { Link } from "@/i18n/Link";
import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/atoms/Button";
import type { DocumentKind, PaymentMethod, PaymentTiming } from "../types";

interface BookingConfirmedProps {
  reference: string;
  companyName: string;
  /** Where the company will reach the renter. */
  email: string;
  payment: { method: PaymentMethod; timing: PaymentTiming | null };
  /** The company's storefront. */
  companyHref: string;
  /** Scans not with the company yet; the booking itself went through. */
  missingDocuments: DocumentKind[];
  /** True while those scans are being sent. */
  uploading: boolean;
  /** Sends them again; left out once the files are no longer at hand. */
  onRetryDocuments?: () => void;
}

/** Shown in place of the form once the request has been sent. */
export function BookingConfirmed({
  reference,
  companyName,
  email,
  payment,
  companyHref,
  missingDocuments,
  uploading,
  onRetryDocuments,
}: BookingConfirmedProps) {
  const t = useTranslations("booking.confirmed");
  const steps = [
    t("steps.review", { company: companyName }),
    ...(payment.method === "cash"
      ? [t("steps.cashConfirm", { email }), t("steps.cashPay")]
      : [
          t("steps.onlineLink", { email }),
          payment.timing === "all_at_once"
            ? t("steps.allAtOnce")
            : t("steps.rentalFirst"),
        ]),
  ];
  // Which scans are missing, as the messages name them.
  const missing = missingDocuments.length > 1 ? "both" : missingDocuments[0];
  const count = missingDocuments.length;

  return (
    <div>
      <CircleCheck
        aria-hidden
        className="size-10 text-success"
        strokeWidth={1.5}
      />
      {/* Focused on arrival so screen readers announce the outcome. */}
      <h1
        tabIndex={-1}
        data-autofocus
        className="mt-4 font-display text-h2 outline-none md:text-h1"
      >
        {t("title")}
      </h1>
      <p className="mt-3 max-w-prose text-lead text-foreground-secondary">
        {t.rich("body", {
          company: companyName,
          reference,
          ref: (chunks) => (
            <span className="font-mono font-medium whitespace-nowrap">
              {chunks}
            </span>
          ),
        })}
      </p>

      {uploading ? (
        <p role="status" className="mt-6 max-w-prose text-sm font-medium">
          {t("uploading")}
        </p>
      ) : (
        missing && (
          <div
            role="alert"
            className="mt-6 max-w-prose rounded-md border border-border p-4"
          >
            <p className="font-medium">
              {onRetryDocuments
                ? t(`uploadFailed.${missing}`)
                : t(`notArrived.${missing}`)}
            </p>
            <p className="mt-1 text-sm text-foreground-secondary">
              {onRetryDocuments
                ? t("retryOrBring", { company: companyName, count })
                : t("bring", { company: companyName, count })}
            </p>
            {onRetryDocuments && (
              <Button
                size="sm"
                variant="dark"
                className="mt-3"
                onClick={onRetryDocuments}
              >
                {t("tryAgain")}
              </Button>
            )}
          </div>
        )
      )}

      <h2 className="mt-10 text-h4 font-semibold">{t("nextTitle")}</h2>
      <ol className="mt-4 grid max-w-prose gap-4">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-4">
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-muted font-mono text-caption"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-prose text-sm text-muted">{t("notCharged")}</p>

      <Button asChild variant="dark" className="mt-8">
        <Link href={companyHref}>{t("more", { company: companyName })}</Link>
      </Button>
    </div>
  );
}
