import type { LucideIcon } from "lucide-react";

export interface TrustPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface TrustStripProps {
  /** Names the list for assistive tech, e.g. "Why book on Veltrio". */
  label: string;
  points: TrustPoint[];
}

/** A thin row of promises right under the search, e.g. "No booking fees". */
export function TrustStrip({ label, points }: TrustStripProps) {
  return (
    <ul
      aria-label={label}
      className="grid gap-3 text-meta sm:grid-cols-3 sm:gap-6 sm:text-center"
    >
      {points.map(({ icon: Icon, title, description }) => (
        <li key={title}>
          <span className="flex items-center gap-2 font-semibold sm:justify-center">
            <Icon
              aria-hidden
              className="size-4 shrink-0 text-accent"
              strokeWidth={2}
            />
            {title}
          </span>
          <span className="mt-0.5 block pl-6 text-muted sm:pl-0">
            {description}
          </span>
        </li>
      ))}
    </ul>
  );
}
