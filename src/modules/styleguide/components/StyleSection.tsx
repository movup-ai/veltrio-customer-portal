import type { ReactNode } from "react";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

interface StyleSectionProps {
  /** Anchor id, linked from the page's section nav. */
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function StyleSection({
  id,
  title,
  description,
  children,
}: StyleSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-28">
      <SectionHeading
        id={headingId}
        variant="editorial"
        title={title}
        description={description}
        className="mb-8 border-b border-border pb-6"
      />
      <div className="space-y-10">{children}</div>
    </section>
  );
}
