import { type NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isLocale,
  type Locale,
  locales,
} from "@/lib/i18n/config";

/** Picks a locale from the `NEXT_LOCALE` cookie, then `Accept-Language`. */
function pickLocale(request: NextRequest): Locale {
  const saved = request.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(saved)) return saved;

  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        tag: tag.toLowerCase().split("-")[0],
        q: q ? Number.parseFloat(q.split("=")[1]) : 1,
      };
    })
    .filter((entry) => !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  // A `find` predicate does not narrow its result, so loop to keep the type.
  for (const entry of ranked) {
    if (isLocale(entry.tag)) return entry.tag;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = pickLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip internals, the favicon, and anything with a file extension.
  matcher: ["/((?!_next|favicon.ico|.*\\.).*)"],
};
