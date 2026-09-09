/** A chapter as returned by `GET /v2/chapters/` on the bhagavad-gita3 RapidAPI. */
export interface Chapter {
  id: number;
  /** Sanskrit name in Devanagari, e.g. "अर्जुनविषादयोग". */
  name: string;
  slug: string;
  /** Romanised Sanskrit, e.g. "Arjun Viṣhād Yog". */
  name_transliterated: string;
  /** Anglicised name, e.g. "Arjuna Visada Yoga". */
  name_translated: string;
  verses_count: number;
  chapter_number: number;
  /** English only — the API has no Hindi counterpart for this field. */
  name_meaning: string;
  chapter_summary: string;
  chapter_summary_hindi: string;
}

/** One of the several translations attached to every verse. */
export interface Translation {
  id: number;
  description: string;
  author_name: string;
  /** "english" or "hindi" in practice, but the API does not constrain it. */
  language: string;
}

/** A verse as returned by `GET /v2/chapters/{n}/verses/`. */
export interface Verse {
  id: number;
  verse_number: number;
  chapter_number: number;
  slug: string;
  /** Devanagari, with "\n\n" between lines. */
  text: string;
  /** Romanised Sanskrit. */
  transliteration: string;
  /** Dense semicolon-separated glossary. Fetched but not rendered. */
  word_meanings: string;
  translations: Translation[];
}
