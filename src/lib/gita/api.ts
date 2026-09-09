import "server-only";

import { notFound } from "next/navigation";
import type { Locale } from "../i18n/config";
import type { Chapter, Translation, Verse } from "./types";

const API_HOST = "bhagavad-gita3.p.rapidapi.com";
const CHAPTER_COUNT = 18;

/**
 * The one place that talks to RapidAPI.
 *
 * The key is read only on the server, so it never reaches the browser.
 * `force-cache` is load-bearing: Next 16 does not cache `fetch` by default, and
 * a single uncached read would make every route that touches it dynamic.
 */
async function gitaFetch<T>(path: string): Promise<T> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error(
      "RAPIDAPI_KEY is not set. Copy env-sample.txt to .env and add your key.",
    );
  }

  const res = await fetch(`https://${API_HOST}${path}`, {
    cache: "force-cache",
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": API_HOST,
    },
  });

  // The API answers an unknown chapter with 404 and `{"detail":"..."}`.
  if (res.status === 404) notFound();

  if (!res.ok) {
    throw new Error(`Bhagavad Gita API responded with ${res.status}`);
  }

  return res.json();
}

/** Fetches all 18 chapter summaries, once per locale at build time. */
export async function getChapters(): Promise<Chapter[]> {
  const chapters = await gitaFetch<Chapter[]>(
    `/v2/chapters/?skip=0&limit=${CHAPTER_COUNT}`,
  );
  return chapters.toSorted((a, b) => a.chapter_number - b.chapter_number);
}

/**
 * Resolves a URL slug to its chapter, 404ing on anything unrecognised.
 *
 * `getChapters()` is both `force-cache`d and memoised within a render pass, so
 * this validates the slug without costing an extra request.
 */
export async function getChapterBySlug(slug: string): Promise<Chapter> {
  const chapters = await getChapters();
  const chapter = chapters.find((candidate) => candidate.slug === slug);
  if (!chapter) notFound();
  return chapter;
}

export function getChapter(chapterNumber: number): Promise<Chapter> {
  return gitaFetch<Chapter>(`/v2/chapters/${chapterNumber}/`);
}

/** Fetches every verse of a chapter — the API returns them all in one call. */
export async function getVerses(chapterNumber: number): Promise<Verse[]> {
  const verses = await gitaFetch<Verse[]>(
    `/v2/chapters/${chapterNumber}/verses/`,
  );
  return verses.toSorted((a, b) => a.verse_number - b.verse_number);
}

/** The API ships several translations per verse; take the first for this locale. */
export function pickTranslation(
  verse: Verse,
  locale: Locale,
): Translation | undefined {
  const language = locale === "hi" ? "hindi" : "english";
  return (
    verse.translations.find(
      (translation) => translation.language === language,
    ) ?? verse.translations[0] // fall back rather than render an empty verse
  );
}
