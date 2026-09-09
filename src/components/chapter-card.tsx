import Link from "next/link";
import type { Chapter } from "@/lib/gita/types";
import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/numerals";

export function ChapterCard({
  chapter,
  locale,
  dict,
  index,
}: {
  chapter: Chapter;
  locale: Locale;
  dict: { chapterLabel: string; verses: string };
  index: number;
}) {
  const hi = locale === "hi";

  // Every chapter string below comes straight from the API field for this
  // locale — nothing here is translated by us.
  const title = hi ? chapter.name : chapter.name_translated;
  const summary = (
    hi ? chapter.chapter_summary_hindi : chapter.chapter_summary
  ).trim();
  const number = formatNumber(chapter.chapter_number, locale, 2);
  const verses = formatNumber(chapter.verses_count, locale);

  return (
    <article
      className="animate-rise group relative isolate flex w-full flex-col overflow-hidden rounded-xl border border-rule bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-rule-strong hover:bg-surface-raised hover:shadow-[0_12px_32px_-12px_rgb(var(--shadow)/var(--shadow-strength))] has-[a:focus-visible]:border-rule-strong has-[a:focus-visible]:bg-surface-raised"
      style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-2 -top-6 -z-10 select-none text-[7rem] leading-none font-semibold text-numeral transition-transform duration-500 group-hover:scale-105 ${
          hi ? "deva" : "font-display"
        }`}
      >
        {number}
      </span>

      <p
        className={`text-[0.7rem] font-medium text-saffron ${
          hi ? "deva" : "uppercase tracking-[0.18em]"
        }`}
      >
        {dict.chapterLabel} {number}
      </p>

      <h3
        className={`mt-3 text-2xl text-ink ${hi ? "deva" : "font-display"}`}
        lang={hi ? "sa" : undefined}
      >
        <Link
          href={`/${locale}/chapter/${chapter.slug}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {title}
        </Link>
      </h3>

      <p className="mt-1 text-sm italic text-indigo" lang="sa">
        {chapter.name_transliterated}
      </p>

      {/* name_meaning has no Hindi counterpart in the API, so it is English-only. */}
      {!hi && (
        <p className="mt-3 text-sm font-medium text-ink-soft">
          {chapter.name_meaning}
        </p>
      )}

      <p
        title={summary}
        className={`mt-4 line-clamp-5 text-sm leading-relaxed text-muted ${
          hi ? "deva" : ""
        }`}
      >
        {summary}
      </p>

      <p className="mt-5 flex items-center gap-2 border-t border-rule pt-4 text-xs text-muted">
        <LotusIcon />
        <span className={hi ? "deva" : ""}>
          {verses} {dict.verses}
        </span>
      </p>
    </article>
  );
}

function LotusIcon() {
  return (
    <svg
      className="size-3.5 text-saffron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20c-4.5 0-8-2.8-8-6.3 2 0 3.6.6 4.7 1.6C8 13.4 8.6 10.7 12 8c3.4 2.7 4 5.4 3.3 7.3 1.1-1 2.7-1.6 4.7-1.6 0 3.5-3.5 6.3-8 6.3Z" />
      <path d="M12 8c0-2 .8-3.6 2-4.6-2 .3-3.3 1.6-3.3 1.6" />
    </svg>
  );
}
