import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/shared/config/site";
import { subdomainFromHost } from "@/shared/lib/tenant";

/** Internal route tree that serves company subdomains. Never reachable by its own path. */
const TENANT_ROOT = "/s";

/**
 * Multi-tenant routing: abc-rental.<root>, its /vehicles/x, /pay/x, /sign/x and /receipt/x are
 * served by app/s/[subdomain]/..., while the address bar keeps the subdomain URL.
 */
export function proxy(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const subdomain = subdomainFromHost(host);
  const { pathname, search } = request.nextUrl;

  if (!subdomain) {
    if (pathname === TENANT_ROOT || pathname.startsWith(`${TENANT_ROOT}/`)) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
    return NextResponse.next();
  }

  if (
    pathname === "/" ||
    pathname.startsWith("/vehicles/") ||
    pathname.startsWith("/pay/") ||
    pathname.startsWith("/sign/") ||
    pathname.startsWith("/receipt/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `${TENANT_ROOT}/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Everything else lives on the marketplace itself.
  return NextResponse.redirect(new URL(pathname + search, siteConfig.url));
}

export const config = {
  // Skip Next internals and files with an extension.
  matcher: "/((?!_next/|.*\\..*).*)",
};
