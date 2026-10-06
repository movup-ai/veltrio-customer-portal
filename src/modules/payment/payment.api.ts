import type { PaymentLink, PaymentPart, PaymentPartStatus } from "./types";

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
    receipt: receipt
      ? {
          tenantId: receipt.tenantId,
          bookingId: receipt.bookingId,
          token: receipt.token,
        }
      : null,
  };
}
