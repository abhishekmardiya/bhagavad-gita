import { ChapterCard } from "@/components/chapter-card";
import { getChapters } from "@/lib/gita/api";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function ChapterGrid() {
  const [chapters, dict, locale] = await Promise.all([
    getChapters(),
    getDictionary(),
    getLocale(),
  ]);

  return (
    <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {chapters.map((chapter, index) => (
        <li key={chapter.id} className="flex">
          <ChapterCard
            chapter={chapter}
            locale={locale}
            dict={dict}
            index={index}
          />
        </li>
      ))}
    </ul>
  );
}
