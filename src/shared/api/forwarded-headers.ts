import { headers } from "next/headers";

/** The renter's device and address from their own request, for an API call that keeps them as evidence. */
export async function forwardedHeaders() {
  const request = await headers();
  const forwarded: Record<string, string> = {};
  const agent = request.get("user-agent");
  const address = request.get("x-forwarded-for");
  if (agent) forwarded["User-Agent"] = agent;
  if (address) forwarded["X-Forwarded-For"] = address;
  return forwarded;
}
