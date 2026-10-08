import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { JsonLd } from "@/shared/lib/seo";
import { SectionHeading } from "@/shared/ui/molecules/SectionHeading";

export interface Faq {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  eyebrow: string;
  title: ReactNode;
  faqs: Faq[];
}

/** Common renter questions, each opening in place; also published as FAQ structured data. */
export function FaqSection({ eyebrow, title, faqs }: FaqSectionProps) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="grid scroll-mt-24 items-start gap-x-16 lg:grid-cols-[1fr_1.6fr]"
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <SectionHeading
        id="faq-heading"
        variant="editorial"
        eyebrow={eyebrow}
        title={title}
      />
      <ul className="border-t border-border">
        {faqs.map((faq) => (
          <li key={faq.question} className="border-b border-border">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lead font-semibold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Plus
                  aria-hidden
                  className="size-5 shrink-0 transition-transform duration-300 ease-standard group-open:rotate-45 motion-reduce:transition-none"
                />
              </summary>
              <p className="max-w-prose pb-6 text-muted">{faq.answer}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
