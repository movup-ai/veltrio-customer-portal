import { NextIntlClientProvider, type Messages } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";

type Namespace = keyof Messages;

interface ClientMessagesProps {
  /** The message files the interactive parts inside read; `common` is always sent. */
  namespaces?: Exclude<Namespace, "common">[];
  children: ReactNode;
}

/** Sends the browser only the messages its part of the page reads. */
export async function ClientMessages({
  namespaces = [],
  children,
}: ClientMessagesProps) {
  const messages = await getMessages();
  const names: Namespace[] = ["common", ...namespaces];
  return (
    <NextIntlClientProvider
      messages={Object.fromEntries(names.map((name) => [name, messages[name]]))}
    >
      {children}
    </NextIntlClientProvider>
  );
}
