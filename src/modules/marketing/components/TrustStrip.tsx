import type { LucideIcon } from "lucide-react";

export interface TrustPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** A thin row of promises under the search, e.g. "No booking fees". */
export function TrustStrip({ points }: { points: TrustPoint[] }) {
  return (
    <ul
      aria-label="Why book on Veltrio"
      className="grid gap-x-8 gap-y-5 rounded-xl border border-border bg-surface p-5 sm:grid-cols-3 md:px-8"
    >
      {points.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-surface-muted">
            <Icon aria-hidden className="size-5" strokeWidth={1.75} />
          </span>
          <span>
            <span className="block font-semibold">{title}</span>
            <span className="block text-sm text-muted">{description}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
