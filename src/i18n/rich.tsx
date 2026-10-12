import type { ReactNode } from "react";

/** Renders the <em> of a message, e.g. "Good to know <em>before you book.</em>". */
export const em = (chunks: ReactNode) => <em>{chunks}</em>;

/** The same on a dark panel, where emphasis takes the accent colour. */
export const emOnInverse = (chunks: ReactNode) => (
  <em className="text-accent-on-inverse">{chunks}</em>
);
