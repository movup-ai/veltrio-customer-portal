import { describe, expect, it } from "vitest";
import { companiesContent, pricingContent } from "./companies.content";

type Translator = Parameters<typeof companiesContent>[0];

/** Answers with the key and the values it was given, so a test can see both. */
const t = ((key: string, values?: Record<string, unknown>) =>
  values ? `${key} ${JSON.stringify(values)}` : key) as unknown as Translator;

describe("companiesContent", () => {
  it("shows the Spanish screenshot where there is one, and the English one where not", () => {
    const src = (locale: "en" | "es") =>
      Object.values(companiesContent(t, locale).figures).map(
        (figure) => figure.image.src,
      );
    expect(src("en")).toEqual([
      "/marketing/site-en.jpg",
      "/marketing/calendar-en.jpg",
      "/marketing/booking-checks-en.jpg",
      "/marketing/pay-detail-en.jpg",
      "/marketing/booking-detail-en.jpg",
    ]);
    expect(src("es")).toEqual([
      "/marketing/site-en.jpg",
      "/marketing/calendar-es.jpg",
      "/marketing/booking-checks-es.jpg",
      "/marketing/pay-detail-en.jpg",
      "/marketing/booking-detail-es.jpg",
    ]);
  });

  it("takes the sample booking through the product's statuses, one stage per chapter", () => {
    const { chapters, stages, chapter } = companiesContent(t, "en");
    expect(chapters.map((each) => each.label)).toEqual(
      ["I", "II", "III", "IV", "V", "VI", "VII"].map(
        (number) => `story.chapterN {"number":"${number}"}`,
      ),
    );
    expect(stages.map((stage) => stage.status)).toEqual([
      "story.ticket.statuses.pending",
      "story.ticket.statuses.confirmed",
      "story.ticket.statuses.confirmed",
      "story.ticket.statuses.ready",
      "story.ticket.statuses.ready",
      "story.ticket.statuses.onRental",
      "story.ticket.statuses.completed",
    ]);
    // Each status keeps its own colour, the same one wherever it appears.
    expect(stages.map((stage) => stage.tone)).toEqual([
      "pending",
      "confirmed",
      "confirmed",
      "ready",
      "ready",
      "onRental",
      "completed",
    ]);
    expect(chapter("money")).toMatchObject({
      id: "chapter-money",
      stamp: { step: "story.ticket.steps.payout", tone: "ready" },
    });
  });

  it("quotes prices, the trial and the sample payout from the shared figures", () => {
    const { hero, pricingLine, money, companyFaqs } = companiesContent(t, "en");
    expect(hero.facts.slice(1)).toEqual([
      'story.facts.price {"price":"$39","percent":15,"trialDays":7}',
      'story.facts.trial {"price":"$39","percent":15,"trialDays":7}',
    ]);
    expect(pricingLine).toBe(
      'pricingSummary.description {"price":"$39","percent":15,"trialDays":7}',
    );
    expect([money.paid, money.share]).toEqual(["$2,307.99", "$0"]);
    expect(companyFaqs[0]?.answer).toContain('"price":"$39"');
  });
});

describe("pricingContent", () => {
  it("prices each plan monthly with the yearly saving, and its limits", () => {
    const { plans } = pricingContent(t);
    expect(
      plans.map((plan) => [plan.name, plan.price, plan.priceNote]),
    ).toEqual([
      ["Starter", "$39", 'pricing.yearly {"price":"$399","percent":15}'],
      ["Growth", "$99", 'pricing.yearly {"price":"$999","percent":16}'],
      ["Pro", "$199", 'pricing.yearly {"price":"$1,999","percent":16}'],
      ["Enterprise", "pricing.custom", undefined],
    ]);
    expect(plans[1]?.features.slice(0, 2)).toEqual([
      'pricing.features.vehiclesUpTo {"count":20}',
      'pricing.features.branches {"count":3}',
    ]);
    expect(plans[3]?.features[0]).toBe(
      'pricing.features.vehiclesMoreThan {"count":50}',
    );
    expect(
      plans.filter((plan) => plan.featured).map((plan) => plan.name),
    ).toEqual(["Growth"]);
  });

  it("lists the credit packs with their price per credit and what each check uses", () => {
    const { credits } = pricingContent(t);
    expect(credits.packs.map((pack) => [pack.price, pack.detail])).toEqual([
      ["$45", 'pricingPage.credits.perCredit {"price":"$1.50"}'],
      ["$80", 'pricingPage.credits.perCredit {"price":"$1.33"}'],
      ["$180", 'pricingPage.credits.perCredit {"price":"$1.20"}'],
    ]);
    expect(credits.costs.slice(0, 2)).toEqual([
      'pricingPage.credits.background {"count":2}',
      'pricingPage.credits.insurance {"count":5}',
    ]);
  });
});
