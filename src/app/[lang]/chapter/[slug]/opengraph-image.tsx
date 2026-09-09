import { getChapterBySlug, getChapters } from "@/lib/gita/api";
import { getDictionaryFor, toLocale } from "@/lib/i18n/dictionaries";
import { formatNumber } from "@/lib/i18n/numerals";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";

export const alt =
  "Bhagavad Gita chapter — Krishna and Arjuna on the chariot at Kurukshetra";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Mirrors the page's own params so the 36 cards are prerendered alongside the
 * 36 pages instead of being rendered on demand.
 */
export async function generateStaticParams() {
  const chapters = await getChapters();
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

/**
 * The page's own card: its number, name, transliteration, summary and verse
 * count, in the locale being shared.
 *
 * `getChapterBySlug` reads the `force-cache`d chapter list, which already
 * carries the summaries, so a card costs no extra request.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = toLocale(lang);

  const [chapter, dict] = await Promise.all([
    getChapterBySlug(slug),
    getDictionaryFor(locale),
  ]);

  const hi = locale === "hi";

  return renderOgCard({
    locale,
    eyebrow: `${dict.chapterLabel} ${formatNumber(chapter.chapter_number, locale, 2)}`,
    title: hi ? chapter.name : chapter.name_translated,
    subtitle: chapter.name_transliterated,
    body: hi ? chapter.chapter_summary_hindi : chapter.chapter_summary,
    footer: `${dict.siteName} · ${formatNumber(chapter.verses_count, locale)} ${dict.verses}`,
  });
}
