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
