import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

/**
 * A slim bar that stays out of the way: brand on the left, controls on the
 * right. The large title lives in `SiteHero`, on the homepage only, so inner
 * pages start at their own <h1> instead of a second one.
 */
export async function SiteHeader() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-parchment/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-6">
        <Link
          href={`/${locale}`}
          className="flex items-baseline gap-2.5 transition-colors hover:text-saffron"
        >
          {/* Dropped on narrow screens so the wordmark and the controls fit. */}
          <span className="deva hidden text-xs text-saffron sm:inline">
            {dict.siteNameDevanagari}
          </span>
          <span
            className={`text-base text-ink transition-colors hover:text-saffron ${
              locale === "hi" ? "deva" : "font-display"
            }`}
          >
            {dict.siteName}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitch
            current={locale}
            groupLabel={dict.languageLabel}
            labels={{ en: dict.english, hi: dict.hindi }}
          />
          <ThemeToggle label={dict.themeLabel} />
        </div>
      </div>
    </header>
  );
}
