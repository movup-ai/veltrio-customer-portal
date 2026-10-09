import {
  toPolicy,
  type CancellationPolicy,
} from "@/shared/lib/cancellation-policy";
import type {
  PaymentExtension,
  PaymentLink,
  PaymentPart,
  PaymentPartStatus,
  Receipt,
} from "./types";

interface PaymentPartDto {
  status: string;
  amountCents: number;
  clientSecret: string | null;
}

/** PublicPaymentRead from the API. */
export interface PaymentLinkDto {
  companyName: string;
  reference: string;
  renterName: string;
  vehicleName: string;
  vehiclePhotoUrl: string | null;
  vehicleSpecs: PaymentLink["vehicleSpecs"];
  pickupAt: string;
  returnAt: string;
  pickupLocation: string;
  currency: string;
  depositCents: number;
  stripeAccountId: string | null;
  charge: PaymentPartDto | null;
  deposit: PaymentPartDto | null;
  extension?:
    (PaymentPartDto & Omit<PaymentExtension, keyof PaymentPart>) | null;
  cancellationPolicy?: CancellationPolicy | null;
  receipt?: PaymentLink["receipt"];
}

const STATUSES: PaymentPartStatus[] = ["open", "processing", "paid", "held"];

function toPart(dto: PaymentPartDto | null): PaymentPart | null {
  if (!dto) return null;
  const status = dto.status as PaymentPartStatus;
  return {
    // A status this build does not know is treated as nothing left to do.
    status: STATUSES.includes(status) ? status : "closed",
    amountCents: dto.amountCents,
    clientSecret: dto.clientSecret,
  };
}

export function toPaymentLink(dto: PaymentLinkDto): PaymentLink {
  const specs = dto.vehicleSpecs;
  const receipt = dto.receipt;
  const extension = dto.extension;
  const asked = toPart(extension ?? null);
  return {
    companyName: dto.companyName,
    reference: dto.reference,
    renterName: dto.renterName,
    vehicleName: dto.vehicleName,
    vehiclePhotoUrl: dto.vehiclePhotoUrl,
    vehicleSpecs: specs && {
      year: specs.year,
      vehicleType: specs.vehicleType,
      transmission: specs.transmission,
      fuelType: specs.fuelType,
      seats: specs.seats,
    },
    pickupAt: dto.pickupAt,
    returnAt: dto.returnAt,
    pickupLocation: dto.pickupLocation,
    currency: dto.currency,
    depositCents: dto.depositCents,
    stripeAccountId: dto.stripeAccountId,
    charge: toPart(dto.charge),
    deposit: toPart(dto.deposit),
    extension:
      extension && asked
        ? {
            ...asked,
            newReturnAt: extension.newReturnAt,
            expiresAt: extension.expiresAt,
            accepted: extension.accepted,
            applied: extension.applied,
            agreementNumber: extension.agreementNumber,
          }
        : null,
    cancellationPolicy: toPolicy(dto.cancellationPolicy),
    receipt: receipt
      ? {
          bookingId: receipt.bookingId,
          token: receipt.token,
        }
      : null,
  };
}

/** PublicReceiptRead from the API. */
export interface ReceiptDto extends Omit<Receipt, "payments"> {
  payments: {
    kind: string;
    method: string | null;
    amountCents: number;
    refundedCents: number;
    completedAt: string | null;
  }[];
}

export function toReceipt(dto: ReceiptDto): Receipt {
  const specs = dto.vehicleSpecs;
  return {
    number: dto.number,
    companyName: dto.companyName,
    reference: dto.reference,
    renterName: dto.renterName,
    vehicleName: dto.vehicleName,
    vehiclePhotoUrl: dto.vehiclePhotoUrl,
    vehicleSpecs: specs && {
      year: specs.year,
      vehicleType: specs.vehicleType,
      transmission: specs.transmission,
      fuelType: specs.fuelType,
      seats: specs.seats,
    },
    pickupAt: dto.pickupAt,
    returnAt: dto.returnAt,
    pickupLocation: dto.pickupLocation,
    currency: dto.currency,
    totalCents: dto.totalCents,
    receivedCents: dto.receivedCents,
    balanceCents: dto.balanceCents,
    payments: dto.payments.map((payment) => ({
      kind: payment.kind === "deposit" ? "deposit" : "rental",
      method: payment.method,
      amountCents: payment.amountCents,
      refundedCents: payment.refundedCents,
      completedAt: payment.completedAt,
    })),
  };
}
