import { pickTranslation } from "@/lib/gita/api";
import type { Verse } from "@/lib/gita/types";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/numerals";

export function VerseCard({
  verse,
  locale,
  dict,
  index,
}: {
  verse: Verse;
  locale: Locale;
  dict: { verseLabel: string; translationBy: string };
  index: number;
}) {
  const hi = locale === "hi";
  const translation = pickTranslation(verse, locale);

  // The API separates the two lines of a shloka with a blank line, which opens
  // a full paragraph gap once rendered with `whitespace-pre-line`.
  const text = verse.text.trim().replace(/\n{2,}/g, "\n");
  const reference = `${formatNumber(verse.chapter_number, locale)}.${formatNumber(
    verse.verse_number,
    locale,
  )}`;

  return (
    <article
      className="animate-rise rounded-xl border border-rule bg-surface p-6"
      style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
    >
      {/* A tinted pill rather than a plain eyebrow: with 47-78 cards on a page,
          the reference is the thing readers scan for. */}
      <p
        className={`inline-flex items-center rounded-full bg-saffron/12 px-3 py-1 text-sm font-semibold text-saffron ${
          hi ? "deva" : "uppercase tracking-[0.12em]"
        }`}
      >
        {dict.verseLabel} {reference}
      </p>

      <p
        lang="sa"
        className="deva mt-4 whitespace-pre-line text-lg leading-loose text-ink"
      >
        {text}
      </p>

      <p
        lang="sa"
        className="mt-4 whitespace-pre-line text-sm italic leading-relaxed text-indigo"
      >
        {verse.transliteration.trim()}
      </p>

      {translation && (
        <div className="mt-5 border-t border-rule pt-4">
          <p
            className={`text-[0.95rem] leading-relaxed text-ink-soft ${
              hi ? "deva" : ""
            }`}
          >
            {translation.description.trim()}
          </p>
          <p className={`mt-3 text-xs text-muted ${hi ? "deva" : ""}`}>
            {dict.translationBy} {translation.author_name}
          </p>
        </div>
      )}
    </article>
  );
}
