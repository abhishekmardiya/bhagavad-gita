# Bhagavad Gita

A server-rendered reader for the eighteen chapters of the Bhagavad Gita, in English and Hindi.

Chapter summaries come from the [bhagavad-gita3 RapidAPI](https://rapidapi.com/bhagavad-gita-bhagavad-gita-default/api/bhagavad-gita3). The API returns both languages, so **nothing is machine-translated** — each locale renders the field the API provides for it.

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Biome.

## Requirements

- Node.js **20.9+** (Next.js 16 minimum; Node 18 is not supported)
- A free RapidAPI key for the bhagavad-gita3 API

## Setup

```bash
npm install
cp env-sample.txt .env      # then paste your key into .env
npm run dev
```

Open http://localhost:3000 — it redirects to `/en` or `/hi` based on your browser's `Accept-Language`.

`.env` holds a single variable:

```
RAPIDAPI_KEY=your-key-here
```

`.env` is gitignored (`.gitignore` ignores `.env*`); `env-sample.txt` is the committed template.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on :3000 (Turbopack, default in Next 16) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Biome lint + format check |
| `npm run format` | Biome, writing fixes |
| `npm run ts` | `tsc --noEmit` in watch mode |

## How it works

### Routing and language

Every route lives under `src/app/[lang]/`, so the locale is a URL segment: `/en`, `/hi`.

- [`src/proxy.ts`](src/proxy.ts) redirects locale-less paths. It prefers a `NEXT_LOCALE` cookie, falls back to parsing `Accept-Language` q-values, then defaults to `en`. (Next 16 renamed the `middleware` convention to `proxy`.)
- Because `[lang]` sits above the root layout, it is a **root parameter**. Any server component reads it via `next/root-params` instead of prop-drilling — see [`src/lib/i18n/dictionaries.ts`](src/lib/i18n/dictionaries.ts).
- [`src/components/language-switch.tsx`](src/components/language-switch.tsx) swaps the first path segment rather than hardcoding `/en`/`/hi`, so it keeps working as deeper routes are added. It also writes the `NEXT_LOCALE` cookie.

Unknown locales 404 through the `notFound()` guard in `getLocale()`.

### What is translated, and what isn't

Chapter content is always verbatim API output:

| Card slot | `en` | `hi` |
| --- | --- | --- |
| Title | `name_translated` | `name` (Devanagari) |
| Subtitle | `name_transliterated` | `name_transliterated` |
| Meaning | `name_meaning` | *omitted* |
| Summary | `chapter_summary` | `chapter_summary_hindi` |

`name_meaning` is dropped in Hindi because the API has no Hindi counterpart for it — showing it would mix languages on the card.

UI chrome ("The Eighteen Chapters", "verses", toggle labels) has no API equivalent, so those ~15 strings are hand-written in [`src/lib/i18n/dictionaries/`](src/lib/i18n/dictionaries/). The `Dictionary` interface forces `en.json` and `hi.json` to stay in sync — a missing key is a type error.

Numbers are formatted, not translated: `Intl.NumberFormat("hi-IN-u-nu-deva")` renders `४७ श्लोक`.

### API key handling

The key is read only in [`src/lib/gita/api.ts`](src/lib/gita/api.ts), which is guarded three ways:

1. No `NEXT_PUBLIC_` prefix, so Next never inlines it into the client bundle.
2. `import "server-only"` turns an accidental client import into a build error.
3. The page is server-rendered, so the browser never contacts RapidAPI at all — no route-handler passthrough is needed.

To confirm after a build: `grep -r "<your key>" .next/static` should return nothing, and DevTools should show zero requests to `bhagavad-gita3.p.rapidapi.com`.

### Rendering and data freshness

Both locales are **statically prerendered at build time**. `next build` reports:

```
└   /[lang]
  ├ ● /en
  └ ● /hi        ● (SSG) prerendered as static HTML
```

Two pieces are required, and both matter:

1. [`generateStaticParams`](src/app/[lang]/page.tsx) declares `en` and `hi` as the paths to prerender.
2. The chapter fetch sets `cache: "force-cache"`. This is not optional — Next 16 leaves `fetch` **uncached by default**, and a single uncached read forces the whole route to render dynamically no matter what `generateStaticParams` returns.

The result is one API call per locale per build and **zero at runtime**. Locally that takes serving `/en` from ~400 ms (live API round-trip on every request) to ~2 ms.

Data is frozen until the next build. That is deliberate: chapter summaries are fixed scripture text, so there is nothing to refresh, and the site keeps serving if the upstream API goes down. To pick up an upstream edit, redeploy.

If you ever do want background refresh without a redeploy, add `export const revalidate = 86400` to [`src/app/[lang]/page.tsx`](src/app/[lang]/page.tsx) for daily ISR.

### Theming

Light, dark, and system, handled by [`next-themes`](https://github.com/pacocoursey/next-themes) following the [shadcn/ui setup](https://ui.shadcn.com/docs/dark-mode/next).

[`src/components/theme-provider.tsx`](src/components/theme-provider.tsx) wraps `NextThemesProvider`; the root layout mounts it with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and `disableTransitionOnChange`. `<html>` carries `suppressHydrationWarning` because the theme class is applied by a pre-paint script rather than by React.

next-themes injects that script itself, so there is no flash before paint, and it also sets `color-scheme` on `<html>` so native scrollbars and form controls match the theme.

Colors are CSS custom properties defined completely on `:root`, then redefined under `.dark`. Components use semantic tokens (`bg-surface`, `text-ink`) so most need no `dark:` variants at all. There is deliberately **no `prefers-color-scheme` block** — next-themes resolves the system preference and reflects it in the class, so a media query would override an explicit "light" choice on a dark-mode machine.

[`src/components/theme-toggle.tsx`](src/components/theme-toggle.tsx) is a two-state button (`setTheme` between light and dark) whose icon is chosen by CSS from the `dark` class rather than by React state — no hydration mismatch, no post-mount flicker, so it needs no `mounted` guard. Its label is static (`themeLabel`) for the same reason. For the three-way Light/Dark/System dropdown from the shadcn docs, you would need shadcn's `DropdownMenu` and a `mounted` guard.

Typography: Marcellus for English display, Noto Serif Devanagari for Sanskrit/Hindi, Inter for UI — all self-hosted via `next/font`. **Never apply letter-spacing to Devanagari**; it breaks conjuncts apart (`श्रीमद्भगवद्गीता` → `श्री म द्भ ग व द्री ता`).

## Project structure

```
src/
  proxy.ts                    locale redirect (sibling of app/)
  app/
    globals.css               design tokens + theming
    [lang]/
      layout.tsx              root layout, fonts, theme script
      page.tsx                homepage
      error.tsx               API-failure boundary
  lib/
    gita/api.ts               server-only fetch
    gita/types.ts             Chapter type
    i18n/config.ts            locales + type guard
    i18n/dictionaries.ts      getDictionary() via next/root-params
    i18n/dictionaries/        en.json, hi.json (UI chrome only)
  components/
    site-header.tsx           wordmark, language switch, theme toggle
    chapter-grid.tsx          fetches and lays out the 18 cards
    chapter-card.tsx          per-locale field selection
    language-switch.tsx       client
    theme-toggle.tsx          client
    theme-provider.tsx        client, wraps next-themes
```

## Notes for contributors

This project runs Next.js 16, which has breaking changes from earlier versions. Version-matched docs ship inside the repo at `node_modules/next/dist/docs/` — read those rather than relying on memory. See `AGENTS.md`.

`error.tsx` is a Client Component, so it cannot use `next/root-params`; it reads the locale from `usePathname()` instead.

### Known dev-only warning

Switching theme in development can surface:

> Encountered a script tag while rendering React component.

This is harmless and **dev-only**. `next-themes` renders its pre-paint script as a `<script>` element inside the provider, and React 19 warns whenever the client renders one. The warning lives only in React's `.development.js` builds — production is unaffected, and the toggle works correctly in both. There is no upstream fix as of `next-themes@0.4.6`; the only way to remove it is to stop using `next-themes` and emit the script from the Server Component layout instead.

## Not yet built

Chapter detail and verse pages (`/[lang]/chapter/[slug]`). The data layer, dictionaries, locale plumbing, and language switch are all shaped so those drop in without refactoring.
