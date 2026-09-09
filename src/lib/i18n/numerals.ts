import type { Locale } from "./config";

const devanagari = new Intl.NumberFormat("hi-IN-u-nu-deva");

/**
 * Devanagari numerals for Hindi, Latin digits otherwise.
 *
 * `pad` left-pads the Latin form only — Devanagari numerals are decorative here
 * and padding them reads as a typo rather than as alignment.
 */
export function formatNumber(value: number, locale: Locale, pad = 0): string {
  return locale === "hi"
    ? devanagari.format(value)
    : String(value).padStart(pad, "0");
}
