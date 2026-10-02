import { cn } from "@/shared/lib/cn";
import { RADII, SHADOWS } from "@/modules/styleguide/tokens";
import { StyleSection } from "./StyleSection";
import { TokenValue } from "./TokenValue";

export function ShapeSection() {
  return (
    <StyleSection
      id="shape"
      title="Shape and elevation"
      description="Corners get rounder as surfaces get larger. Shadows are reserved for things that float above the page."
    >
      <div>
        <h3 className="mb-4 text-h4 font-semibold">Radius</h3>
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-5">
          {RADII.map((radius) => (
            <li key={radius.name}>
              <div
                className={cn(
                  "h-20 border border-border-strong bg-surface",
                  radius.className,
                )}
              />
              <p className="mt-2 text-sm font-semibold">{radius.name}</p>
              <p className="font-mono text-label text-muted">
                <TokenValue
                  probeClass={radius.className}
                  property="borderRadius"
                />
              </p>
              <p className="mt-1 text-meta text-muted">{radius.use}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-4 text-h4 font-semibold">Elevation</h3>
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {SHADOWS.map((shadow) => (
            <li key={shadow.name}>
              <div
                className={cn("h-24 rounded-lg bg-surface", shadow.className)}
              />
              <p className="mt-3 text-sm font-semibold">shadow-{shadow.name}</p>
              <p className="mt-1 text-meta text-muted">{shadow.use}</p>
            </li>
          ))}
        </ul>
      </div>
    </StyleSection>
  );
}
