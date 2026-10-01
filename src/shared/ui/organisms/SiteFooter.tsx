import Link from "next/link";
import { siteConfig } from "@/shared/config/site";
import { Logo } from "@/shared/ui/atoms/Logo";

export interface FooterColumn {
  title: string;
  links: { href: string; label: string }[];
}

interface SiteFooterProps {
  columns: FooterColumn[];
}

export function SiteFooter({ columns }: SiteFooterProps) {
  return (
    <footer className="mt-20 bg-surface-muted pt-14 pb-7">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3.5 max-w-xs text-meta text-muted">
              The marketplace for independent rental companies and the people
              who love to drive.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-3.5 text-sm font-semibold">{column.title}</h2>
              <ul className="grid gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
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
        <p className="mt-10 border-t border-border pt-5 text-meta text-muted">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
