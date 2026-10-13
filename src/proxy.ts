import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/shared/config/site";
import { subdomainFromHost } from "@/shared/lib/tenant";

/** Internal route tree that serves company subdomains. Never reachable by its own path. */
const TENANT_ROOT = "/s";
/** A path no page claims, so the not-found page answers. */
const NOWHERE = "/404";

const handleLanguage = createMiddleware(routing);

/**
 * Sends a request to an internal path, in its language. next-intl routes by the path it is
 * given, so the path is set first and its answer is then pointed back at the public address.
 */
function serve(request: NextRequest, internalPath: string, prefix: string) {
  const publicPath = request.nextUrl.pathname;
  request.nextUrl.pathname = prefix + internalPath;
  const response = handleLanguage(request);

  const location = response.headers.get("location");
  if (location) {
    // A redirect to another language: it must name the public path, not the internal one.
    const target = new URL(location);
    const moved = target.pathname.slice(0, -internalPath.length || undefined);
    const unprefixed = prefix ? publicPath.slice(prefix.length) : publicPath;
    target.pathname = (moved + unprefixed).replace(/\/$/, "") || "/";
    response.headers.set("location", target.toString());
    return response;
  }
  if (response.headers.has("x-middleware-rewrite")) return response;

  // Left as it was, which would serve the public path: rewrite it, keeping next-intl's headers.
  const rewritten = NextResponse.rewrite(request.nextUrl);
  response.headers.forEach((value, name) => {
    if (name !== "x-middleware-next" && name !== "set-cookie") {
      rewritten.headers.set(name, value);
    }
  });
  for (const cookie of response.cookies.getAll()) rewritten.cookies.set(cookie);
  return rewritten;
}

/**
 * Multi-tenant and multi-language routing. abc-rental.<root>, its /vehicles/x, /bookings/x,
 * /pay/x, /sign/x and /receipt/x are served by app/[locale]/s/[subdomain]/..., while the
 * address bar keeps the subdomain URL. A language other than English adds a prefix: /es/….
 */
export function proxy(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const subdomain = subdomainFromHost(host);
  const { pathname, search } = request.nextUrl;

  const [, first = ""] = pathname.split("/");
  const prefix = hasLocale(routing.locales, first) ? `/${first}` : "";
  // The path as English would have it.
  const path = pathname.slice(prefix.length) || "/";

  if (!subdomain) {
    if (path === TENANT_ROOT || path.startsWith(`${TENANT_ROOT}/`)) {
      return serve(request, NOWHERE, prefix);
    }
    return handleLanguage(request);
  }

  if (
    path === "/" ||
    path.startsWith("/vehicles/") ||
    path.startsWith("/bookings/") ||
    path.startsWith("/pay/") ||
    path.startsWith("/sign/") ||
    path.startsWith("/receipt/")
  ) {
    const internalPath = `${TENANT_ROOT}/${subdomain}${path === "/" ? "" : path}`;
    return serve(request, internalPath, prefix);
  }

  // Everything else lives on the marketplace itself.
  return NextResponse.redirect(new URL(pathname + search, siteConfig.url));
}

export const config = {
  // Skip Next internals, Sentry's tunnel (next.config.ts) and files with an extension.
  matcher: "/((?!_next/|monitoring|.*\\..*).*)",
};
