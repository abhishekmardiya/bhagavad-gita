import { ChapterGrid } from "@/components/chapter-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteHero } from "@/components/site-hero";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export default async function HomePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const hi = locale === "hi";

  return (
    <>
      <SiteHeader />
      <SiteHero />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h2 className={`text-2xl text-ink ${hi ? "deva" : "font-display"}`}>
            {dict.chaptersHeading}
          </h2>
          <p className={`mt-2 text-sm text-muted ${hi ? "deva" : ""}`}>
            {dict.chaptersSubheading}
          </p>
        </div>

        <ChapterGrid />
      </main>

      <SiteFooter />
    </>
  );
}
