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
          className="inline-flex items-center text-saffron transition-colors hover:text-saffron-soft"
        >
          {/* The wordmark is the whole logo, so it carries the weight and size
              a mark needs — and no letter-spacing, which would break the
              conjuncts and matras of the Devanagari.

              The nudge optically centres it. Noto Serif Devanagari reserves
              0.625em of descent for below-base conjuncts, but this string
              drops only ~0.11em below the baseline, so `items-center` centres
              a box whose ink rides ~0.24em high. Line-height cannot fix this
              — half-leading is symmetric, so it moves the box and the ink
              together. Measured against the header centre, not guessed. */}
          <span
            className="deva translate-y-[0.24em] text-xl font-semibold"
            lang="sa"
          >
            {dict.siteNameDevanagari}
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
