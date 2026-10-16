import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/shared/config/site";
import type { LegalDocumentName, LegalSection } from "../legal";

/** A legal page: its title and date, a list of contents, then numbered sections. */
export async function LegalDocument({
  document,
}: {
  document: LegalDocumentName;
}) {
  const t = await getTranslations("legal");
  const sections = t.raw(`${document}.sections`) as LegalSection[];
  const email = siteConfig.supportEmail;
  return (
    <article className="mx-auto max-w-prose">
      <h1 className="font-display text-h2 md:text-h1">
        {t(`${document}.title`)}
      </h1>
      <p className="mt-3 text-meta text-muted">
        {t("updated", { date: t("updatedDate") })}
      </p>
      <p className="mt-6 text-lead">{t(`${document}.intro`)}</p>

      <nav
        aria-labelledby="legal-contents"
        className="mt-8 rounded-xl border border-border bg-surface p-5"
      >
        <h2 id="legal-contents" className="type-label text-muted">
          {t("contents")}
        </h2>
        <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-sm">
          {sections.map((section, index) => (
            <li key={section.title}>
              <a
                href={`#section-${index + 1}`}
                className="underline-offset-4 hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((section, index) => (
        <section
          key={section.title}
          id={`section-${index + 1}`}
          className="mt-10 scroll-mt-24"
        >
          <h2 className="text-h4 font-semibold">
            {index + 1}. {section.title}
          </h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-foreground-secondary">
              {paragraph}
            </p>
          ))}
          {section.items && (
            <ul className="mt-3 grid list-disc gap-2 pl-5 text-foreground-secondary">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {/* Left out while no address is set, rather than naming one nobody reads. */}
      {email && (
        <section id="contact" className="mt-10 scroll-mt-24">
          <h2 className="text-h4 font-semibold">{t("contact.title")}</h2>
          <p className="mt-3 text-foreground-secondary">
            {t.rich("contact.body", {
              address: email,
              email: (chunks) => (
                <a
                  href={`mailto:${email}`}
                  className="font-semibold underline underline-offset-4"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>
      )}
    </article>
  );
}
