import "server-only";

import type { Chapter } from "./types";

const API_HOST = "bhagavad-gita3.p.rapidapi.com";
const CHAPTER_COUNT = 18;

/**
 * Fetches all 18 chapter summaries
 *
 * The key is still read only on the server, so it never reaches the browser.
 */
export async function getChapters(): Promise<Chapter[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error(
      "RAPIDAPI_KEY is not set. Copy env-sample.txt to .env and add your key.",
    );
  }

  const res = await fetch(
    `https://${API_HOST}/v2/chapters/?skip=0&limit=${CHAPTER_COUNT}`,
    {
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": API_HOST,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Bhagavad Gita API responded with ${res.status}`);
  }

  const chapters: Chapter[] = await res.json();
  return chapters.toSorted((a, b) => a.chapter_number - b.chapter_number);
}
