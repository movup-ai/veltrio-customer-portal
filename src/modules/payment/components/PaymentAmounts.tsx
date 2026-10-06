import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib/format";
import type { PaymentLink } from "../types";

interface PaymentAmountsProps {
  link: Pick<
    PaymentLink,
    "charge" | "deposit" | "currency" | "depositCents" | "companyName"
  >;
}

interface RowProps {
  label: string;
  /** What happens to this money. */
  note: string;
  amount: string;
  /** The row the eye should land on. */
  lead?: boolean;
  /** Named for the record, not asked for by this link. */
  aside?: boolean;
}

function Row({ label, note, amount, lead, aside }: RowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt>
        <span
          className={cn("block", lead ? "text-ui font-semibold" : "text-sm")}
        >
          {label}
        </span>
        <span className="block text-meta text-muted">{note}</span>
      </dt>
      <dd
        className={cn(
          "tabular-nums",
          lead ? "text-h3 font-bold" : "text-ui font-bold",
          aside && "font-medium text-muted",
        )}
      >
        {amount}
      </dd>
    </div>
  );
}

/**
 * What the link asks for, one row for each thing that happens to the card. A deposit is held,
 * never charged, so it is its own row and is never added to the amount due.
 */
export function PaymentAmounts({ link }: PaymentAmountsProps) {
  const { charge, deposit, currency, depositCents, companyName } = link;
  const money = (cents: number) => formatMoney(cents, currency);
  const rows: ReactNode[] = [];

  if (charge) {
    rows.push(
      <Row
        key="charge"
        lead
        label="Amount due"
        note={
          deposit
            ? "Charged to your card now. Does not include the deposit."
            : "Charged to your card now"
        }
        amount={money(charge.amountCents)}
      />,
    );
  }
  if (deposit) {
    rows.push(
      <Row
        key="deposit"
        lead={!charge}
        label="Security deposit hold"
        note="Held on your card, not charged. Released after the return."
        amount={money(deposit.amountCents)}
      />,
    );
  } else if (charge && depositCents > 0) {
    rows.push(
      <Row
        key="deposit-later"
        aside
        label="Security deposit"
        note={`Not part of this payment. ${companyName} arranges it before pick-up.`}
        amount={money(depositCents)}
      />,
    );
  }

  if (rows.length === 0) return null;
  return <dl className="grid gap-3">{rows}</dl>;
}
