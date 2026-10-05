import type { ReactNode } from "react";

interface BookingSectionProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/** One titled card of the booking form. */
export function BookingSection({
  title,
  description,
  children,
}: BookingSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 text-carbon shadow-1 md:p-6">
      <h2 className="text-h4 font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 max-w-prose text-sm text-graphite">{description}</p>
      )}
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}
