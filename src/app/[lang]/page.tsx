import { ChapterGrid } from "@/components/chapter-grid";
import { SiteHeader } from "@/components/site-header";
import { locales } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

// Prerender /en and /hi at build time.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function HomePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const hi = locale === "hi";

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-14">
        <div className="mb-10">
          <h2 className={`text-2xl text-ink ${hi ? "deva" : "font-display"}`}>
            {dict.chaptersHeading}
          </h2>
          <p className={`mt-2 text-sm text-muted ${hi ? "deva" : ""}`}>
            {dict.chaptersSubheading}
          </p>
        </div>

        <ChapterGrid />
      </main>

      <footer className="border-t border-rule">
        <p className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-muted">
          {dict.siteNameDevanagari}
        </p>
      </footer>
    </>
  );
}
