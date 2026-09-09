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
  errorTitle: string;
  errorBody: string;
  retry: string;
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
