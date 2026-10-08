"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { BookingBranch } from "./BookingBranch";

const BookingReturnContext = createContext<
  [string, (location: string) => void]
>(["", () => {}]);

/** Shares the branch the car comes back to between the form and the summary beside it. */
export function BookingReturnProvider({
  pickupLocation,
  children,
}: {
  /** Where the car comes back until the renter chooses otherwise. */
  pickupLocation: string;
  children: ReactNode;
}) {
  const state = useState(pickupLocation);
  return <BookingReturnContext value={state}>{children}</BookingReturnContext>;
}

export const useBookingReturn = () => useContext(BookingReturnContext);

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
