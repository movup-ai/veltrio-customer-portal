import type { ReactNode } from "react";

interface SearchBannerProps {
  title: string;
  /** The search, centred under the title. */
  children: ReactNode;
  /** A line of reassurance right under the search, e.g. the trust points. */
  note?: ReactNode;
}

/** The top of the landing page: its title, the search and a line of reassurance. Sits under a solid SiteHeader. */
export function SearchBanner({ title, children, note }: SearchBannerProps) {
  return (
    <section className="container-page flex flex-col items-center pt-8 md:pt-12">
      <h1 className="text-center font-display text-h2 md:text-h1">{title}</h1>
      <div className="mt-6 w-full max-w-5xl">{children}</div>
      {note && <div className="mt-4 w-full max-w-5xl md:mt-6">{note}</div>}
    </section>
  );
}
