"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isLocale } from "@/lib/i18n/config";
import en from "@/lib/i18n/dictionaries/en.json";
import hi from "@/lib/i18n/dictionaries/hi.json";

// Error boundaries are Client Components, so the locale comes from the URL
// rather than `next/root-params`, which is Server Components only.
const dictionaries = { en, hi };

export default function ChaptersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const segment = usePathname().split("/")[1];
  const locale = isLocale(segment) ? segment : "en";
  const dict = dictionaries[locale];
  const deva = locale === "hi" ? "deva" : "";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <h1
        className={`text-2xl text-ink ${locale === "hi" ? "deva" : "font-display"}`}
      >
        {dict.errorTitle}
      </h1>
      <p className={`mt-3 text-sm leading-relaxed text-muted ${deva}`}>
        {dict.errorBody}
      </p>
      <button
        type="button"
        onClick={reset}
        className={`mt-6 rounded-full bg-saffron px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 ${deva}`}
      >
        {dict.retry}
      </button>
    </main>
  );
}
