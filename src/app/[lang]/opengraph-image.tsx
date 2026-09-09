import { locales } from "@/lib/i18n/config";
import { getDictionaryFor, toLocale } from "@/lib/i18n/dictionaries";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";

export const alt =
  "Bhagavad Gita — Krishna and Arjuna on the chariot at Kurukshetra";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * The layout's `generateStaticParams` covers the pages, but this Route Handler
 * needs its own to be prerendered rather than served on demand.
 */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * One card per locale. `lang` comes from the prop rather than
 * `next/root-params` so the route still prerenders — see `toLocale`.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  const dict = await getDictionaryFor(locale);

  return renderOgCard({
    locale,
    eyebrow: dict.siteNameDevanagari,
    title: dict.siteName,
    body: dict.tagline,
    footer: dict.chaptersHeading,
  });
}
