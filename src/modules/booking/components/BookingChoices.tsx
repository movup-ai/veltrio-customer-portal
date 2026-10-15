"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { quoteBooking, type VehiclePricing } from "../booking.quote";
import type { BookingDates, BookingQuote } from "../types";
import { BookingBranch } from "./BookingBranch";
import { BookingSummary, type BookingSummaryProps } from "./BookingSummary";

interface BookingChoices {
  returnLocation: [string, (location: string) => void];
  drivers: [number, (count: number) => void];
  /** Priced on the drivers chosen so far. */
  quote: BookingQuote | null;
}

const BookingChoicesContext = createContext<BookingChoices>({
  returnLocation: ["", () => {}],
  drivers: [0, () => {}],
  quote: null,
});

/** Shares what the renter chooses in the form with the summary beside it, and prices it. */
export function BookingChoicesProvider({
  pickupLocation,
  pricing,
  dates,
  children,
}: {
  /** Where the car comes back until the renter chooses otherwise. */
  pickupLocation: string;
  pricing: VehiclePricing;
  dates: BookingDates;
  children: ReactNode;
}) {
  const returnLocation = useState(pickupLocation);
  const drivers = useState(0);
  const quote = quoteBooking(pricing, dates, drivers[0]);
  return (
    <BookingChoicesContext value={{ returnLocation, drivers, quote }}>
      {children}
    </BookingChoicesContext>
  );
}

export const useBookingReturn = () =>
  useContext(BookingChoicesContext).returnLocation;
export const useBookingDrivers = () =>
  useContext(BookingChoicesContext).drivers;
export const useBookingQuote = () => useContext(BookingChoicesContext).quote;

/** The branch the car comes back to, with its address. */
export function BookingReturnLocation({
  addresses,
}: {
  /** Each branch's address by its name. */
  addresses: Record<string, string>;
}) {
  const [location] = useBookingReturn();
  return <BookingBranch name={location} address={addresses[location]} />;
}

/** The summary beside the form, priced on what the renter has chosen in it. */
export function BookingChoicesSummary(
  props: Omit<BookingSummaryProps, "quote">,
) {
  return <BookingSummary {...props} quote={useBookingQuote()} />;
}
