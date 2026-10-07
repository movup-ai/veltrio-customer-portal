import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Receipt } from "../types";
import { ReceiptPayments } from "./ReceiptPayments";

const receipt: Pick<
  Receipt,
  "payments" | "receivedCents" | "balanceCents" | "currency"
> = {
  currency: "USD",
  receivedCents: 12500,
  balanceCents: 0,
  payments: [
    {
      kind: "rental",
      method: "Visa · 4242",
      amountCents: 10000,
      refundedCents: 0,
      // 01:30 UTC on the 7th is still the 6th in New York.
      completedAt: "2026-10-07T01:30:00Z",
    },
    {
      kind: "deposit",
      method: null,
      amountCents: 5000,
      refundedCents: 2500,
      completedAt: null,
    },
  ],
};

const show = (overrides: Partial<typeof receipt> = {}) =>
  render(
    <ReceiptPayments
      receipt={{ ...receipt, ...overrides }}
      timeZone="America/New_York"
    />,
  );

afterEach(cleanup);

describe("ReceiptPayments", () => {
  it("lists each payment with its date on the company's calendar, method and amount", () => {
    show();
    const [rental, deposit] = screen.getAllByRole("listitem");
    expect(rental?.textContent).toContain("Rental payment");
    expect(rental?.textContent).toContain("Oct 6, 2026 · Visa · 4242");
    expect(rental?.textContent).toContain("$100");
    expect(deposit?.textContent).toContain("Deposit captured");
    expect(deposit?.textContent).toContain("$50");
  });

  it("says what was given back out of a payment, and only there", () => {
    show();
    const [rental, deposit] = screen.getAllByRole("listitem");
    expect(within(deposit!).getByText("$25 refunded")).toBeDefined();
    expect(rental?.textContent).not.toContain("refunded");
  });

  it("totals what was received, net of refunds", () => {
    show();
    const total = screen.getByText("Total received").parentElement;
    expect(total?.textContent).toContain("$125");
  });

  it("shows what is still due only while something is", () => {
    show();
    expect(screen.queryByText("Still due")).toBeNull();
    cleanup();

    show({ balanceCents: 4000 });
    expect(screen.getByText("Still due").parentElement?.textContent).toContain(
      "$40",
    );
  });
});
