import { LanguageSwitch } from "@/components/language-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function SiteHeader() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-6 py-4">
        <LanguageSwitch
          current={locale}
          groupLabel={dict.languageLabel}
          labels={{ en: dict.english, hi: dict.hindi }}
        />
        <ThemeToggle label={dict.themeLabel} />
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-16 pt-8 text-center">
        <p className="deva text-sm text-saffron">{dict.siteNameDevanagari}</p>
        <h1
          className={`mt-4 text-4xl text-ink sm:text-5xl ${
            locale === "hi" ? "deva" : "font-display"
          }`}
        >
          {dict.siteName}
        </h1>
        <div
          aria-hidden="true"
          className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-saffron to-transparent"
        />
        <p
          className={`mx-auto mt-6 max-w-xl text-balance text-[0.95rem] leading-relaxed text-muted ${
            locale === "hi" ? "deva" : ""
          }`}
        >
          {dict.tagline}
        </p>
      </div>
    </header>
  );
}
