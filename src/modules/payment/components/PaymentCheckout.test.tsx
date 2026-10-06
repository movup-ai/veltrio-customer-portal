import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const confirmPayment = vi.fn();
const retrievePaymentIntent = vi.fn();

vi.mock("@stripe/stripe-js", () => ({ loadStripe: () => Promise.resolve({}) }));
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: ReactNode }) => children,
  PaymentElement: ({ onReady }: { onReady: () => void }) => (
    <button type="button" onClick={onReady}>
      fields ready
    </button>
  ),
  useStripe: () => ({ confirmPayment, retrievePaymentIntent }),
  useElements: () => ({}),
}));

vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_platform");
const { PaymentCheckout } = await import("./PaymentCheckout");

const onSettled = vi.fn();
const props = {
  stripeAccountId: "acct_company",
  clientSecret: "pi_rental_secret",
  depositSecret: null,
  submitLabel: "Pay $100",
  consent: null,
  paidSecret: null,
  initialError: null,
  onSettled,
};

const submit = () => {
  fireEvent.click(screen.getByText("fields ready"));
  fireEvent.click(screen.getByRole("button", { name: "Pay $100" }));
};

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("PaymentCheckout", () => {
  it("places the hold on the card that just paid", async () => {
    confirmPayment
      .mockResolvedValueOnce({ paymentIntent: { payment_method: "pm_1" } })
      .mockResolvedValueOnce({});
    render(<PaymentCheckout {...props} depositSecret="pi_deposit_secret" />);
    submit();

    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith(null));
    expect(confirmPayment).toHaveBeenLastCalledWith(
      expect.objectContaining({
        clientSecret: "pi_deposit_secret",
        confirmParams: expect.objectContaining({ payment_method: "pm_1" }),
      }),
    );
  });

  it("lets the renter try again when Stripe cannot be reached", async () => {
    confirmPayment.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<PaymentCheckout {...props} />);
    submit();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "didn't go through",
    );
    const button = screen.getByRole("button", { name: "Pay $100" });
    expect(button).toHaveProperty("disabled", false);
    expect(onSettled).not.toHaveBeenCalled();
  });

  it("reports a paid rental as paid when only the hold could not be sent", async () => {
    confirmPayment
      .mockResolvedValueOnce({ paymentIntent: { payment_method: "pm_1" } })
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<PaymentCheckout {...props} depositSecret="pi_deposit_secret" />);
    submit();

    // The page re-reads the link, with the hold's failure and nothing about the payment.
    await vi.waitFor(() =>
      expect(onSettled).toHaveBeenCalledWith(
        "The deposit hold didn't go through.",
      ),
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("finishes the hold for a renter who comes back from paying elsewhere", async () => {
    retrievePaymentIntent.mockResolvedValueOnce({
      paymentIntent: { status: "succeeded", payment_method: "pm_bank" },
    });
    confirmPayment.mockResolvedValueOnce({});
    render(
      <PaymentCheckout
        {...props}
        clientSecret="pi_deposit_secret"
        paidSecret="pi_rental_secret"
      />,
    );

    await vi.waitFor(() => expect(onSettled).toHaveBeenCalledWith(null));
    expect(retrievePaymentIntent).toHaveBeenCalledWith("pi_rental_secret");
    expect(confirmPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        clientSecret: "pi_deposit_secret",
        confirmParams: expect.objectContaining({ payment_method: "pm_bank" }),
      }),
    );
  });

  it("asks for a card when that method cannot hold a deposit", async () => {
    retrievePaymentIntent.mockResolvedValueOnce({
      paymentIntent: { status: "succeeded", payment_method: "pm_bank" },
    });
    confirmPayment.mockResolvedValueOnce({
      error: { message: "Not supported" },
    });
    render(
      <PaymentCheckout
        {...props}
        clientSecret="pi_deposit_secret"
        paidSecret="pi_rental_secret"
      />,
    );

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Enter a card for the hold",
    );
    expect(onSettled).not.toHaveBeenCalled();
  });
});
