import { ArrowRight, Check, Minus } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { CSSProperties } from "react";
import { Link } from "@/i18n/Link";
import type { Locale } from "@/i18n/routing";
import { em } from "@/i18n/rich";
import { FaqSection } from "@/modules/marketing/components/FaqSection";
import { StoryChrome } from "@/modules/marketing/components/story/StoryChrome";
import {
  StoryChapter,
  StoryFigure,
} from "@/modules/marketing/components/story/StoryParts";
import styles from "@/modules/marketing/components/story/story.module.css";
import {
  COMPANIES_PATH,
  PRICING_PATH,
  SHARE_IMAGE,
  companiesContent,
  signUpHref,
} from "@/modules/marketing/companies.content";
import { buildMetadata } from "@/shared/lib/seo";
import { Button } from "@/shared/ui/atoms/Button";
import { ResponsiveImage } from "@/shared/ui/atoms/ResponsiveImage";
import { SiteHeader } from "@/shared/ui/organisms/SiteHeader";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "companies" });
  return buildMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: COMPANIES_PATH,
    locale,
    image: SHARE_IMAGE,
  });
}

/** Staggers the title page's lines as it loads. */
const beat = (n: number) => ({ "--beat": n }) as CSSProperties;

/**
 * The page for rental companies, set as a short printed feature: a title page, then seven
 * chapters that follow one sample booking from request to return.
 */
export default async function ForRentalCompaniesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("companies");
  const content = companiesContent(t, locale);
  const { chapter, figures } = content;

  return (
    <>
      <SiteHeader variant="overlay" />
      <StoryChrome
        chaptersLabel={t("story.chaptersLabel")}
        chapters={content.chapters}
        booking={content.booking}
        stages={content.stages}
      />
      <main id="main">
        {/* The title page: centred on the photograph, under a scrim that sits where the words do. */}
        <section className="relative isolate flex min-h-svh items-center bg-surface-inverse text-on-inverse">
          <ResponsiveImage
            variants={content.hero.image.variants}
            alt={content.hero.image.alt}
            sizes="100vw"
            priority
            className="absolute inset-0 -z-20 size-full object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgb(10_11_13/0.72),rgb(10_11_13/0.35)_75%)]"
          />
          <div className="container-page flex flex-col items-center pt-header pb-12 text-center md:pb-16">
            <p
              className={`type-label text-on-inverse/80 ${styles.arrive}`}
              style={beat(0)}
            >
              {t("story.kicker")}
            </p>
            <h1
              className={`mt-6 max-w-5xl font-display text-h1 text-balance md:text-display ${styles.arrive}`}
              style={beat(1)}
            >
              {t.rich("hero.title", { em })}
            </h1>
            <p
              className={`mt-6 max-w-2xl text-lead text-on-inverse/85 ${styles.arrive}`}
              style={beat(2)}
            >
              {content.hero.description}
            </p>
            <div
              className={`mt-8 flex flex-wrap justify-center gap-3 ${styles.arrive}`}
              style={beat(3)}
            >
              {signUpHref && (
                <Button asChild size="lg">
                  <a href={signUpHref}>{t("hero.startTrial")}</a>
                </Button>
              )}
              <Button asChild size="lg" variant="glass">
                <Link href={PRICING_PATH}>{t("hero.seePricing")}</Link>
              </Button>
            </div>
            <ul
              className={`mt-16 grid w-full max-w-4xl gap-4 border-t border-on-inverse/25 pt-6 sm:grid-cols-3 ${styles.arrive}`}
              style={beat(4)}
            >
              {content.hero.facts.map((fact) => (
                <li key={fact} className="font-display text-h3">
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* I. Renters find you: the claim at full size, the company's own site under it. */}
        <StoryChapter {...chapter("find")} ground="paper">
          <div className="mt-10 max-w-5xl">
            <h2
              id="chapter-find-title"
              className="font-display text-h1 text-balance md:text-display"
            >
              {t.rich("story.chapters.find.title", { em })}
            </h2>
            <p className="mt-6 max-w-2xl text-lead text-foreground-secondary">
              {figures.find.description}
            </p>
          </div>

          <StoryFigure
            image={figures.find.image}
            motion="rise"
            address={content.siteAddress}
            className="mt-14"
          />

          <dl className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {content.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className={`border-t-2 border-foreground pt-5 ${styles.rise}`}
              >
                <dt className="text-h4 font-semibold">{benefit.title}</dt>
                <dd className="mt-2 text-foreground-secondary">
                  {benefit.description}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-20 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
            {(["others", "ours"] as const).map((side) => (
              <div
                key={side}
                className={`bg-surface p-6 md:p-8 ${styles.rise}`}
              >
                <h3
                  className={
                    side === "ours"
                      ? "text-h4 font-semibold"
                      : "text-h4 font-semibold text-muted"
                  }
                >
                  {content.comparison[side].title}
                </h3>
                <ul className="mt-5 grid gap-3">
                  {content.comparison[side].points.map((point) => (
                    <li key={point} className="flex gap-3">
                      {side === "ours" ? (
                        <Check
                          aria-hidden
                          className="mt-1 size-4 shrink-0 text-success"
                        />
                      ) : (
                        <Minus
                          aria-hidden
                          className="mt-1 size-4 shrink-0 text-muted"
                        />
                      )}
                      <span
                        className={
                          side === "ours"
                            ? undefined
                            : "text-foreground-secondary"
                        }
                      >
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </StoryChapter>

        {/* II. The fleet: the calendar wipes in across the full measure, the words under it. */}
        <StoryChapter {...chapter("fleet")} ground="white">
          <StoryFigure
            image={figures.fleet.image}
            motion="wipe"
            className="mt-6"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <h2
              id="chapter-fleet-title"
              className="font-display text-h2 lg:col-span-5"
            >
              {figures.fleet.title}
            </h2>
            <p className="max-w-prose text-lead text-foreground-secondary lg:col-span-6 lg:col-start-7">
              {figures.fleet.description}
            </p>
          </div>
        </StoryChapter>

        {/* III. The checks: the words hold still while the checklist drifts past them. */}
        <StoryChapter {...chapter("checks")} ground="paper">
          <div className="mt-6 grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="chapter-checks-title" className="font-display text-h2">
                {figures.checks.title}
              </h2>
              <p className="mt-5 text-lead text-foreground-secondary">
                {figures.checks.description}
              </p>
            </div>
            <StoryFigure
              image={figures.checks.image}
              motion="drift"
              className="lg:col-span-7"
            />
          </div>
        </StoryChapter>

        {/* IV. Signed and paid: the renter's own payment page, wiped in from the other side. */}
        <StoryChapter {...chapter("paid")} ground="white">
          <div className="mt-6 grid items-center gap-12 lg:grid-cols-12">
            <StoryFigure
              image={figures.paid.image}
              motion="wipe"
              narrow
              className="mx-auto w-full max-w-md lg:col-span-5"
            />
            <div className="lg:col-span-6 lg:col-start-7">
              <h2 id="chapter-paid-title" className="font-display text-h2">
                {figures.paid.title}
              </h2>
              <p className="mt-5 text-lead text-foreground-secondary">
                {figures.paid.description}
              </p>
            </div>
          </div>
        </StoryChapter>

        {/* The one silence on the page: a dark ground and a single line before the peak. */}
        <div className="flex min-h-[70svh] items-center bg-surface-inverse text-on-inverse">
          <p
            className={`container-page font-display text-h1 md:text-display ${styles.rise}`}
          >
            {t("story.chapters.money.intertitle")}
          </p>
        </div>

        {/* V. The peak: where the money goes, Veltrio's share held still while the booking passes beside it. */}
        <StoryChapter {...chapter("money")} ground="inverse" className="pt-16">
          <div className="mt-6 grid gap-16 lg:grid-cols-12">
            <div className="self-start lg:sticky lg:top-28 lg:col-span-7">
              <h2 id="chapter-money-title" className="font-display text-h2">
                {figures.money.title}
              </h2>
              <p className="mt-5 max-w-prose text-lead text-on-inverse/80">
                {figures.money.description}
              </p>
              <dl className="mt-20">
                <div className="grid gap-1 border-t border-on-inverse/20 py-4 sm:grid-cols-[12rem_1fr]">
                  <dt className="type-label text-on-inverse/70">
                    {t("story.chapters.money.paid")}
                  </dt>
                  <dd className="text-h4 font-semibold">
                    {content.money.paid}
                  </dd>
                </div>
                <div className="grid gap-1 border-t border-on-inverse/20 py-4 sm:grid-cols-[12rem_1fr]">
                  <dt className="type-label text-on-inverse/70">
                    {t("story.chapters.money.to")}
                  </dt>
                  <dd className="text-h4 font-semibold">{content.money.to}</dd>
                </div>
                <div className="border-t border-on-inverse/20 pt-4">
                  <dt className="type-label text-on-inverse/70">
                    {t("story.chapters.money.share")}
                  </dt>
                  <dd className="mt-2 font-display text-[clamp(6rem,16vw,13rem)] leading-none text-accent-on-inverse">
                    {content.money.share}
                  </dd>
                  {/* Draws itself as the reader arrives: the line the money does not cross. */}
                  <span
                    aria-hidden
                    className={`mt-6 block h-px bg-on-inverse/60 ${styles.draw}`}
                  />
                </div>
              </dl>
            </div>
            <StoryFigure
              image={figures.money.image}
              motion="rise"
              inverse
              narrow
              className="mx-auto w-full max-w-md lg:col-span-4 lg:col-start-9 lg:mt-96"
            />
          </div>
        </StoryChapter>

        {/* VI. Calm after the peak: what else comes with it, and four steps to begin. */}
        <StoryChapter {...chapter("start")} ground="paper">
          <div className="mt-6 grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="chapter-start-title" className="font-display text-h2">
                {t.rich("start.title", { em })}
              </h2>
              <h3 className="mt-12 type-label text-muted">
                {t("story.chapters.start.moreTitle")}
              </h3>
              <ul className="mt-4 grid gap-2.5">
                {content.moreFeatures.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check
                      aria-hidden
                      className="mt-1 size-4 shrink-0 text-success"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <ol className="grid gap-8 lg:col-span-6 lg:col-start-7">
              {content.gettingStarted.map((step, index) => (
                <li
                  key={step.title}
                  className={`grid grid-cols-[3rem_1fr] gap-4 border-t border-border pt-6 ${styles.rise}`}
                >
                  <span className="font-display text-h3 text-muted">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-h4 font-semibold">{step.title}</p>
                    <p className="mt-2 text-foreground-secondary">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </StoryChapter>

        {/* VII. What it costs, the questions, then the colophon with the one action. */}
        <StoryChapter {...chapter("cost")} ground="white">
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <h2
              id="chapter-cost-title"
              className="font-display text-h2 lg:col-span-5"
            >
              {t.rich("story.chapters.cost.title", { em })}
            </h2>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-lead text-foreground-secondary">
                {content.pricingLine}
              </p>
              <Link
                href={PRICING_PATH}
                className="mt-4 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
              >
                {t("story.chapters.cost.pricing")}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>

          <div className="mt-24">
            <FaqSection
              eyebrow={t("faq.eyebrow")}
              title={t.rich("faq.title", { em })}
              faqs={content.companyFaqs}
            />
          </div>

          {/* The colophon: the action as a sentence, not a button island. */}
          <div className="mt-24 border-t border-border pt-10">
            <p className="type-label text-muted">
              {t("story.chapters.cost.closing")}
            </p>
            {signUpHref ? (
              <a
                href={signUpHref}
                className="group mt-4 inline-flex items-baseline gap-4 font-display text-h2 md:text-h1"
              >
                <span className="underline decoration-1 underline-offset-8 group-hover:decoration-2">
                  {content.trialLabel}
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-8 shrink-0 transition-transform duration-200 ease-standard group-hover:translate-x-1"
                />
              </a>
            ) : (
              <Link
                href={PRICING_PATH}
                className="mt-4 inline-flex font-display text-h2 underline decoration-1 underline-offset-8 md:text-h1"
              >
                {t("story.chapters.cost.pricing")}
              </Link>
            )}
          </div>
        </StoryChapter>
      </main>
    </>
  );
}
