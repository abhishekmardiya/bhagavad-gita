import { VerseCard } from "@/components/verse-card";
import type { Verse } from "@/lib/gita/types";
import type { Locale } from "@/lib/i18n/config";

export function VerseList({
  verses,
  locale,
  dict,
}: {
  verses: Verse[];
  locale: Locale;
  dict: { verseLabel: string; translationBy: string };
}) {
  return (
    <ul className="list-none space-y-5">
      {verses.map((verse, index) => (
        <li key={verse.id}>
          <VerseCard verse={verse} locale={locale} dict={dict} index={index} />
        </li>
      ))}
    </ul>
  );
}
