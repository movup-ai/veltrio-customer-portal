import type { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** One benefit as a card: icon, title and a line of explanation. Render inside a list. */
export function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <li className="rounded-xl border border-border bg-surface p-6">
      <span className="mb-6 grid size-11 place-items-center rounded-md bg-surface-muted">
        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="text-lead font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </li>
  );
}
