import { cn } from "@/shared/lib/cn";
import { FONT_FAMILIES, TYPE_SCALE } from "@/modules/styleguide/tokens";
import { StyleSection } from "./StyleSection";
import { TokenValue } from "./TokenValue";

export function TypographySection() {
  return (
    <StyleSection
      id="typography"
      title="Typography"
      description="A serif for editorial moments, a tight sans for the interface, and a mono for labels and vehicle specs."
    >
      <ul className="grid gap-5 md:grid-cols-3">
        {FONT_FAMILIES.map((font) => (
          <li
            key={font.name}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <p aria-hidden className={cn("text-h1", font.className)}>
              Aa
            </p>
            <p className={cn("mt-4 text-lead", font.className)}>
              {font.family}
            </p>
            <p className="mt-1 text-meta text-muted">{font.use}</p>
            <code className="mt-3 block font-mono text-label text-muted">
              {font.className}
            </code>
          </li>
        ))}
      </ul>

      <div>
        <h3 className="mb-2 text-h4 font-semibold">Scale</h3>
        <ul className="divide-y divide-border">
          {TYPE_SCALE.map((step) => (
            <li
              key={step.name}
              className="grid gap-x-6 gap-y-1 py-4 md:grid-cols-[9rem_minmax(0,1fr)] md:items-baseline"
            >
              <code className="font-mono text-label text-muted">
                {step.className}{" "}
                <TokenValue probeClass={step.className} property="fontSize" />
              </code>
              <p
                className={cn(
                  "truncate",
                  step.className,
                  step.display && "font-display",
                )}
              >
                Keys in hand by noon
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-4 text-h4 font-semibold">Text utilities</h3>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-6">
            <dt className="font-mono text-label text-muted">type-label</dt>
            <dd className="mt-2 type-label">Pick-up location</dd>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6">
            <dt className="font-mono text-label text-muted">type-spec</dt>
            <dd className="mt-2 type-spec">503 hp · 0–60 3.4s · 4 seats</dd>
          </div>
        </dl>
      </div>
    </StyleSection>
  );
}
