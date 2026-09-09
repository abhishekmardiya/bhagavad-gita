import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

// Unlike `error.tsx`, this is a Server Component, so the locale comes from
// `next/root-params` rather than from the URL.
export default async function NotFound() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const deva = locale === "hi" ? "deva" : "";

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <h1
        className={`text-2xl text-ink ${locale === "hi" ? "deva" : "font-display"}`}
      >
        {dict.notFoundTitle}
      </h1>
      <p className={`mt-3 text-sm leading-relaxed text-muted ${deva}`}>
        {dict.notFoundBody}
      </p>
      <Link
        href={`/${locale}`}
        className={`mt-6 rounded-full bg-saffron px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 ${deva}`}
      >
        {dict.backToChapters}
      </Link>
    </main>
  );
}
