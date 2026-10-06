import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import type { Agreement } from "../types";

interface AgreementDocumentProps {
  agreement: Pick<
    Agreement,
    "sections" | "charges" | "totals" | "terms" | "companySignature"
  >;
}

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="type-label text-muted">{children}</h2>;
}

/**
 * The agreement as the renter reads it: the rental in summary, then the terms. Every value
 * arrives worded by the API, so this page and the PDF it stands for cannot differ.
 */
export function AgreementDocument({ agreement }: AgreementDocumentProps) {
  const signed = agreement.companySignature;
  return (
    <div className="grid gap-8">
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {agreement.sections.map((section) => (
          <section key={section.title}>
            <Heading>{section.title}</Heading>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              {section.rows.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-muted">{row.label}</dt>
                  {/* Pick-up and return carry their place on a second line, as the PDF does. */}
                  <dd className="min-w-0 wrap-break-word whitespace-pre-line">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section>
        <Heading>Charges</Heading>
        <ul className="mt-2 divide-y divide-border border-y border-border">
          {agreement.charges.map((charge, index) => (
            <li
              key={index}
              className="flex items-start justify-between gap-4 py-2.5 text-sm"
            >
              <span className="min-w-0">
                {charge.label}
                {charge.detail && (
                  <span className="block text-meta text-muted">
                    {charge.detail}
                  </span>
                )}
              </span>
              <span className="shrink-0 tabular-nums">{charge.amount}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 ml-auto grid max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 text-sm">
          {agreement.totals.map((total) => (
            <div
              key={total.label}
              className={cn("contents", total.strong && "text-ui font-bold")}
            >
              <dt className={cn(!total.strong && "text-muted")}>
                {total.label}
              </dt>
              <dd className="text-right tabular-nums">{total.amount}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <Heading>Terms and conditions</Heading>
        <div className="mt-2 grid max-w-prose gap-2.5 text-sm leading-relaxed">
          {agreement.terms.map((block, index) =>
            block.heading ? (
              <h3 key={index} className="mt-2 text-body font-semibold">
                {block.text}
              </h3>
            ) : (
              // A single line break in the company's text is kept, so a typed list stays a list.
              <p key={index} className="whitespace-pre-line">
                {block.text}
              </p>
            ),
          )}
        </div>
      </section>

      {signed && (
        <section>
          <Heading>Signatures</Heading>
          <div className="mt-2 grid gap-1 text-sm">
            <span className="text-muted">For the company</span>
            {signed.signature ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signed.signature}
                alt={`Signature of ${signed.name}`}
                className="h-18 w-fit rounded-md border border-border bg-white"
              />
            ) : (
              <span className="font-display text-h3">{signed.name}</span>
            )}
            <span className="font-semibold">
              {signed.title ? `${signed.name}, ${signed.title}` : signed.name}
            </span>
            <span className="text-muted">
              {signed.company} · Signed {signed.signed}
            </span>
            {/* Said when it is not the signatory's own act: their signature is applied on issue. */}
            {signed.issuedBy !== signed.name && (
              <span className="text-meta text-muted">
                Applied when issued by {signed.issuedBy}
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
