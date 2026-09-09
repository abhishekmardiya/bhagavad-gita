"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale, locales } from "@/lib/i18n/config";

/** Remembers the choice so a later visit to `/` skips Accept-Language. */
function remember(locale: Locale) {
  // biome-ignore lint/suspicious/noDocumentCookie: CookieStore is not in Safari or Firefox stable.
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageSwitch({
  current,
  labels,
  groupLabel,
}: {
  current: Locale;
  labels: Record<Locale, string>;
  groupLabel: string;
}) {
  const pathname = usePathname();

  // Swap the leading locale segment so this keeps working on deeper routes.
  const hrefFor = (locale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  };

  return (
    <nav
      aria-label={groupLabel}
      className="flex items-center rounded-full border border-rule bg-surface p-0.5"
    >
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={hrefFor(locale)}
            hrefLang={locale}
            aria-current={active ? "true" : undefined}
            onClick={() => remember(locale)}
            className={
              active
                ? "rounded-full bg-saffron px-3 py-1 text-xs font-medium text-white"
                : "rounded-full px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
            }
          >
            {labels[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
