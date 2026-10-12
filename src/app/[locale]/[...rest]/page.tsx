import { notFound } from "next/navigation";

/** Any address no page claims shows the not-found page in the reader's language. */
export default function UnknownPage() {
  notFound();
}
