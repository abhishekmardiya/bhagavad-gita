import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

const REPO_URL = "https://github.com/abhishekmardiya/bhagavad-gita";

export async function SiteFooter() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-xs text-muted">
        <p>{dict.siteNameDevanagari}</p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1.5 transition-colors hover:text-saffron ${
            locale === "hi" ? "deva" : ""
          }`}
        >
          <GitHubIcon />
          {dict.sourceOnGitHub}
        </a>
      </div>
    </footer>
  );
}

function GitHubIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}
