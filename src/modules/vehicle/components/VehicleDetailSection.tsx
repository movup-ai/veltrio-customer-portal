import type { ReactNode } from "react";

interface VehicleDetailSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

/** One titled block of the vehicle page, separated from the next by a hairline. */
export function VehicleDetailSection({
  id,
  title,
  children,
}: VehicleDetailSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-border py-9 first:pt-0"
    >
      <h2 id={headingId} className="mb-5 text-h4 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}
