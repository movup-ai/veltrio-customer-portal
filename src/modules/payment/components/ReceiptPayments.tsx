import { formatMoney } from "@/shared/lib/format";
import type { Receipt } from "../types";

interface ReceiptPaymentsProps {
  receipt: Pick<
    Receipt,
    "payments" | "receivedCents" | "balanceCents" | "currency"
  >;
  /** The company's IANA zone: payment dates are shown on its calendar. */
  timeZone: string;
}

/** Each payment taken on the booking, then what they come to. */
export function ReceiptPayments({ receipt, timeZone }: ReceiptPaymentsProps) {
  const money = (cents: number) => formatMoney(cents, receipt.currency);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "medium",
  });
  return (
    <div>
      <ul className="divide-y divide-border border-t border-border">
        {receipt.payments.map((payment, index) => (
          <li
            key={index}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium">
                {payment.kind === "deposit"
                  ? "Deposit captured"
                  : "Rental payment"}
              </span>
              <span className="block text-meta text-muted">
                {[
                  payment.completedAt &&
                    day.format(new Date(payment.completedAt)),
                  payment.method,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
              {money(payment.amountCents)}
              {payment.refundedCents > 0 && (
                <span className="block text-meta font-normal text-muted">
                  {money(payment.refundedCents)} refunded
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <dl className="border-t border-border pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-ui font-semibold">Total received</dt>
          <dd className="text-h3 font-bold tabular-nums">
            {money(receipt.receivedCents)}
          </dd>
        </div>
        {receipt.balanceCents > 0 && (
          <div className="mt-1 flex items-baseline justify-between gap-4 text-sm text-muted">
            <dt>Still due</dt>
            <dd className="tabular-nums">{money(receipt.balanceCents)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
