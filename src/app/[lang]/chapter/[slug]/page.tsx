import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { VerseList } from "@/components/verse-list";
import {
  getChapter,
  getChapterBySlug,
  getChapters,
  getVerses,
} from "@/lib/gita/api";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { formatNumber } from "@/lib/i18n/numerals";

// `dynamicParams` is left at its default (true) on purpose: with it false, an
// unknown slug is rejected at the routing layer and never renders the [lang]
// segment, so it would get Next's bare global 404 instead of not-found.tsx.
// Letting it render costs nothing — getChapterBySlug resolves against the
// force-cached chapter list and calls notFound() without touching the API.

/**
 * Only `slug` — the parent `[lang]` segment is crossed with these params
 * automatically, giving 18 chapters × 2 locales = 36 prerendered pages.
 */
export async function generateStaticParams() {
  const chapters = await getChapters();
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/chapter/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [chapter, dict, locale] = await Promise.all([
    getChapterBySlug(slug),
    getDictionary(),
    getLocale(),
  ]);

  const hi = locale === "hi";
  const title = hi ? chapter.name : chapter.name_translated;
  const summary = (
    hi ? chapter.chapter_summary_hindi : chapter.chapter_summary
  ).trim();

  return {
    title: `${dict.chapterLabel} ${formatNumber(chapter.chapter_number, locale)} — ${title}`,
    description: summary.slice(0, 160),
  };
}

export default async function ChapterPage({
  params,
}: PageProps<"/[lang]/chapter/[slug]">) {
  const { slug } = await params;

  // Resolves the slug against the cached chapter list, which also validates it.
  const [{ chapter_number }, dict, locale] = await Promise.all([
    getChapterBySlug(slug),
    getDictionary(),
    getLocale(),
  ]);

  const [chapter, verses] = await Promise.all([
    getChapter(chapter_number),
    getVerses(chapter_number),
  ]);

  const hi = locale === "hi";

  // Every chapter string below comes straight from the API field for this
  // locale — nothing here is translated by us.
  const title = hi ? chapter.name : chapter.name_translated;
  const summary = (
    hi ? chapter.chapter_summary_hindi : chapter.chapter_summary
  ).trim();
  const number = formatNumber(chapter.chapter_number, locale);
  const versesCount = formatNumber(chapter.verses_count, locale);

  return (
    <>
      <SiteHeader />

      {/* A reading column, narrower than the homepage grid. */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        <Link
          href={`/${locale}`}
          className={`inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-saffron ${
            hi ? "deva" : ""
          }`}
        >
          <span aria-hidden="true">←</span>
          {dict.backToChapters}
        </Link>

        <header className="mt-8 border-b border-rule pb-10">
          <p
            className={`text-[0.7rem] font-medium text-saffron ${
              hi ? "deva" : "uppercase tracking-[0.18em]"
            }`}
          >
            {dict.chapterLabel} {number}
          </p>

          <h1
            className={`mt-3 text-4xl text-ink ${hi ? "deva" : "font-display"}`}
            lang={hi ? "sa" : undefined}
          >
            {title}
          </h1>

          <p className="mt-2 text-base italic text-indigo" lang="sa">
            {chapter.name_transliterated}
          </p>

          {/* name_meaning has no Hindi counterpart in the API, so it is English-only. */}
          {!hi && (
            <p className="mt-3 text-sm font-medium text-ink-soft">
              {chapter.name_meaning}
            </p>
          )}

          <h2
            className={`mt-8 text-[0.7rem] font-medium text-muted ${
              hi ? "deva" : "uppercase tracking-[0.18em]"
            }`}
          >
            {dict.summaryHeading}
          </h2>
          <p
            className={`mt-3 text-[0.95rem] leading-relaxed text-ink-soft ${
              hi ? "deva" : ""
            }`}
          >
            {summary}
          </p>
        </header>

        <section className="mt-10">
          <h2 className={`text-2xl text-ink ${hi ? "deva" : "font-display"}`}>
            {dict.versesHeading}
          </h2>
          <p className={`mt-2 mb-8 text-sm text-muted ${hi ? "deva" : ""}`}>
            {versesCount} {dict.verses}
          </p>

          <VerseList verses={verses} locale={locale} dict={dict} />
        </section>
      </main>

      <footer className="border-t border-rule">
        <p className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-muted">
          {dict.siteNameDevanagari}
        </p>
      </footer>
    </>
  );
}
