import Link from "next/link";
import { siteConfig, siteHref } from "@/shared/config/site";
import { Logo } from "@/shared/ui/atoms/Logo";

interface FooterLink {
  /** A marketplace path, or a full address such as the portal's or a `mailto:`. */
  href: string;
  label: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SiteFooterProps {
  columns: FooterColumn[];
  /** Links beside the copyright line, e.g. Contact. */
  legalLinks?: FooterLink[];
}

/**
 * The marketplace footer. A page that renders `data-minimal-footer` (a payment, an agreement
 * to sign) gets only the bottom line, so nothing leads the renter away from it.
 */
export function SiteFooter({ columns, legalLinks = [] }: SiteFooterProps) {
  return (
    <footer className="mt-20 bg-surface-muted pt-14 pb-8 group-has-[[data-minimal-footer]]/page:mt-0 group-has-[[data-minimal-footer]]/page:pt-8">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-8 group-has-[[data-minimal-footer]]/page:hidden md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-meta text-muted">
              The marketplace for independent rental companies and the people
              who love to drive.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-4 text-sm font-semibold">{column.title}</h2>
              <ul className="grid gap-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={siteHref(link.href)}
                      prefetch={false}
                      className="text-sm text-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-6 text-meta text-muted group-has-[[data-minimal-footer]]/page:mt-0 group-has-[[data-minimal-footer]]/page:border-0 group-has-[[data-minimal-footer]]/page:pt-0">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          {legalLinks.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={siteHref(link.href)}
                    prefetch={false}
                    className="hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
