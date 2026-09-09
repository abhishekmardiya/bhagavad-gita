import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLocale, type Locale } from "./config";

/** UI chrome only. Every chapter string comes from the API, not from here. */
export interface Dictionary {
  siteName: string;
  siteNameDevanagari: string;
  tagline: string;
  chaptersHeading: string;
  chaptersSubheading: string;
  chapterLabel: string;
  verses: string;
  languageLabel: string;
  english: string;
  hindi: string;
  themeLabel: string;
  scrollToTopLabel: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  backToChapters: string;
  summaryHeading: string;
  versesHeading: string;
  verseLabel: string;
  translationBy: string;
  notFoundTitle: string;
  notFoundBody: string;
  sourceOnGitHub: string;
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  hi: () => import("./dictionaries/hi.json").then((m) => m.default),
};

/**
 * Resolves the active locale from the `[lang]` root segment.
 *
 * `next/root-params` makes this readable from any Server Component under the
 * root layout without prop drilling.
 */
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale]();
}

/**
 * The `params`-based counterpart to `getLocale()`.
 *
 * Metadata image routes (`opengraph-image.tsx`) are Route Handlers rather than
 * Server Components: reading the locale through `next/root-params` there marks
 * them request-time and opts them out of prerendering, so they take `lang` from
 * their own `params` prop and narrow it here instead.
 */
export function toLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

export function getDictionaryFor(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
