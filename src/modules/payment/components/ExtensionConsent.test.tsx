import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PaymentExtension } from "../types";

const acceptExtension = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("../payment.actions", () => ({
  acceptExtension: (...args: unknown[]) => acceptExtension(...args),
}));

const { ExtensionConsent } = await import("./ExtensionConsent");

const extension: PaymentExtension = {
  status: "open",
  amountCents: 11770,
  clientSecret: null,
  newReturnAt: "2026-10-25T13:30:00Z",
  expiresAt: "2026-10-23T13:30:00Z",
  accepted: false,
  applied: false,
  agreementNumber: "AGR-BK-10001",
};

const renderForm = () =>
  render(
    <ExtensionConsent
      address={{ subdomain: "thewheeldeal", token: "tok" }}
      extension={extension}
      defaultName="Kevin Hart"
      currency="USD"
      timeZone="America/New_York"
    />,
  );

const agree = () =>
  fireEvent.click(
    screen.getByRole("button", { name: /Agree and continue to payment/ }),
  );

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("ExtensionConsent", () => {
  it("states the new return, the charge and the agreement it adds to", () => {
    renderForm();

    const terms = screen.getByText(
      /I agree to return the vehicle by/,
    ).textContent;
    expect(terms).toContain("$117.70");
    expect(terms).toContain("rental agreement AGR-BK-10001");
  });

  it("sends nothing until the renter ticks the box", () => {
    renderForm();
    agree();

    expect(screen.getByText(/Tick the box to confirm you agree/)).toBeTruthy();
    expect(acceptExtension).not.toHaveBeenCalled();
  });

  it("records the name as typed, then re-reads the link for the card form", async () => {
    acceptExtension.mockResolvedValueOnce({ ok: true });
    renderForm();
    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "  Kevin D. Hart " },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    agree();

    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(acceptExtension).toHaveBeenCalledWith(
      "thewheeldeal",
      "tok",
      "Kevin D. Hart",
    );
  });

  it("re-reads the link when the request is no longer open, to show how it ended", async () => {
    acceptExtension.mockResolvedValueOnce({ ok: false, reason: "stale" });
    renderForm();
    fireEvent.click(screen.getByRole("checkbox"));
    agree();

    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("lets the renter try again when it could not be recorded", async () => {
    acceptExtension.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    renderForm();
    fireEvent.click(screen.getByRole("checkbox"));
    agree();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "couldn't record that",
    );
    expect(refresh).not.toHaveBeenCalled();
    const button = screen.getByRole("button", { name: /Agree and continue/ });
    expect(button).toHaveProperty("disabled", false);
  });
});
