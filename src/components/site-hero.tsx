import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

/** Homepage only — inner pages carry their own heading instead. */
export async function SiteHero() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const hi = locale === "hi";

  return (
    <section className="border-b border-rule">
      <div className="mx-auto max-w-3xl px-6 py-10 text-center sm:py-12">
        <h1
          className={`text-4xl text-ink sm:text-5xl ${hi ? "deva" : "font-display"}`}
        >
          {dict.siteName}
        </h1>
        <div
          aria-hidden="true"
          className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-saffron to-transparent"
        />
        <p
          className={`mx-auto mt-5 max-w-xl text-balance text-[0.95rem] leading-relaxed text-muted ${
            hi ? "deva" : ""
          }`}
        >
          {dict.tagline}
        </p>
      </div>
    </section>
  );
}
