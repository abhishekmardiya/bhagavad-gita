# Bhagavad Gita

A server-rendered reader for the eighteen chapters of the Bhagavad Gita — chapter summaries and every verse — in English and Hindi.

Content comes from the [bhagavad-gita3 RapidAPI](https://rapidapi.com/bhagavad-gita-bhagavad-gita-default/api/bhagavad-gita3). The API returns both languages, so **nothing is machine-translated** — each locale renders the field the API provides for it.

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

`.env` holds two variables:

| Variable | Required | What it does |
| --- | --- | --- |
| `RAPIDAPI_KEY` | yes | bhagavad-gita3 API key. Server-only — never prefix it with `NEXT_PUBLIC_`. |
| `SITE_URL` | for deploys off Vercel | Canonical origin, used as `metadataBase` so `og:image` URLs are absolute. Unset, it falls back to `https://$VERCEL_PROJECT_PRODUCTION_URL` (set automatically on Vercel) and then to `http://localhost:3000`. |

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

### Routes

| Route | Page |
| --- | --- |
| `/[lang]` | Homepage — the eighteen chapter cards |
| `/[lang]/chapter/[slug]` | One chapter: header, summary, and every verse |

Chapter slugs come from the API (`chapter-1-arjuna-visada-yoga`), so no slug table is maintained here.

### Routing and language

Every route lives under `src/app/[lang]/`, so the locale is a URL segment: `/en`, `/hi`.

- [`src/proxy.ts`](src/proxy.ts) redirects locale-less paths. It prefers a `NEXT_LOCALE` cookie, falls back to parsing `Accept-Language` q-values, then defaults to `en`. (Next 16 renamed the `middleware` convention to `proxy`.)
- Because `[lang]` sits above the root layout, it is a **root parameter**. Any server component reads it via `next/root-params` instead of prop-drilling — see [`src/lib/i18n/dictionaries.ts`](src/lib/i18n/dictionaries.ts).
- [`src/components/language-switch.tsx`](src/components/language-switch.tsx) swaps the first path segment rather than hardcoding `/en`/`/hi`, so it keeps working on chapter URLs as well as the homepage. It also writes the `NEXT_LOCALE` cookie.

Unknown locales 404 through the `notFound()` guard in `getLocale()`. Unknown chapter slugs 404 through `getChapterBySlug()`, which resolves the slug against the already-cached chapter list — no extra API call.

### What is translated, and what isn't

Chapter and verse content is always verbatim API output:

| Chapter slot | `en` | `hi` |
| --- | --- | --- |
| Title | `name_translated` | `name` (Devanagari) |
| Subtitle | `name_transliterated` | `name_transliterated` |
| Meaning | `name_meaning` | *omitted* |
| Summary | `chapter_summary` | `chapter_summary_hindi` |

| Verse slot | `en` | `hi` |
| --- | --- | --- |
| Shloka | `text` (Devanagari) | `text` (Devanagari) |
| Transliteration | `transliteration` | `transliteration` |
| Translation | first `english` translation | first `hindi` translation |
| Credit | `author_name` | `author_name` |

`name_meaning` is dropped in Hindi because the API has no Hindi counterpart for it — showing it would mix languages on the card.

Each verse ships several translations. `pickTranslation()` in [`src/lib/gita/api.ts`](src/lib/gita/api.ts) takes the first one matching the locale's language and falls back to the first translation of any language, so a verse never renders blank.

UI chrome ("The Eighteen Chapters", "verses", toggle labels, error and not-found copy) has no API equivalent, so those ~20 strings are hand-written in [`src/lib/i18n/dictionaries/`](src/lib/i18n/dictionaries/). The `Dictionary` interface forces `en.json` and `hi.json` to stay in sync — a missing key is a type error.

Numbers are formatted, not translated: [`formatNumber()`](src/lib/i18n/numerals.ts) renders `४७ श्लोक` in Hindi via `Intl.NumberFormat("hi-IN-u-nu-deva")`, and left-pads the Latin form only (`01`) — padded Devanagari numerals read as a typo rather than as alignment.

### API key handling

The key is read only in [`src/lib/gita/api.ts`](src/lib/gita/api.ts), which is guarded three ways:

1. No `NEXT_PUBLIC_` prefix, so Next never inlines it into the client bundle.
2. `import "server-only"` turns an accidental client import into a build error.
3. Pages are server-rendered, so the browser never contacts RapidAPI at all — no route-handler passthrough is needed.

To confirm after a build: `grep -r "<your key>" .next/static` should return nothing, and DevTools should show zero requests to `bhagavad-gita3.p.rapidapi.com`.

### Rendering and data freshness

Every page is **statically prerendered at build time** — both homepages and all 18 × 2 = 36 chapter pages. `next build` reports:

```
Route (app)
┌ ○ /_not-found
├   /[lang]
│ ├ ● /en
│ └ ● /hi
├   /[lang]/chapter/[slug]
│ ├ ● /en/chapter/chapter-1-arjuna-visada-yoga
│ ├ ● /en/chapter/chapter-2-sankhya-yoga
│ ├ ● /en/chapter/chapter-3-karma-yoga
│ └ ● [+33 more paths]
├ ƒ /[lang]/chapter/[slug]/opengraph-image
├ ƒ /[lang]/opengraph-image
├ ○ /apple-icon.png
└ ○ /icon.svg
```

The two `opengraph-image` routes are `ƒ` — **server-rendered on demand**, not prerendered. That is fine for social cards, which are fetched by a crawler once per share rather than by readers, but it does mean an image is rendered at request time. See [Social preview images](#social-preview-images).

Three pieces are required, and all of them matter:

1. [`generateStaticParams`](src/app/[lang]/layout.tsx) in the **layout** — not the homepage — declares `en` and `hi`. Declaring it on the layout is what lets nested routes inherit both locales; on `page.tsx` it would only cover the homepage.
2. [`generateStaticParams`](src/app/[lang]/chapter/[slug]/page.tsx) on the chapter route returns only `slug`. Next crosses it with the inherited `[lang]` values, giving 36 pages from 18 entries.
3. The fetches set `cache: "force-cache"`. This is not optional — Next 16 leaves `fetch` **uncached by default**, and a single uncached read forces the whole route to render dynamically no matter what `generateStaticParams` returns.

The result is **zero API calls when serving a page**. Locally that takes serving `/en` from ~400 ms (live API round-trip on every request) to ~2 ms. (The on-demand OG routes do read the chapter list, but it comes from the build's persisted fetch cache rather than from RapidAPI.)

Data is frozen until the next build. That is deliberate: chapter summaries and verses are fixed scripture text, so there is nothing to refresh, and the site keeps serving if the upstream API goes down. To pick up an upstream edit, redeploy.

If you ever do want background refresh without a redeploy, add `export const revalidate = 86400` to a page for daily ISR.

#### Build-time warning: verse payloads over 2MB

`next build` prints a line like this for a handful of chapters:

```
Failed to set Next.js data cache for .../v2/chapters/18/verses/,
items over 2MB can not be cached (5212646 bytes)
```

Next's data cache refuses individual entries larger than 2MB, and the verse lists for the longest chapters (2, 3, 4, 6, 13, 18) exceed it. **The build still succeeds and the pages still prerender** — the only cost is that those responses are fetched once per locale instead of being reused, so a build makes a few dozen API calls rather than the theoretical minimum. Nothing is served dynamically as a result.

### Metadata and icons

- The layout's `generateMetadata` sets the per-locale title, tagline, `metadataBase`, and the Open Graph / Twitter card text. `og:locale` follows the URL segment (`en_US` / `hi_IN`).
- The chapter route's `generateMetadata` sets a per-chapter title (`Chapter 2 — Sankhya Yoga`) and uses the first 160 characters of the locale's summary as the description.
- Icons are file conventions in `src/app/`: [`icon.svg`](src/app/icon.svg) (an Om mark), `apple-icon.png`, and `favicon.ico`. Next serves and links them automatically.

### Social preview images

Every page has its own 1200×630 card, generated through the `opengraph-image` file convention — [one for each homepage](src/app/[lang]/opengraph-image.tsx) and [one per chapter per locale](src/app/[lang]/chapter/[slug]/opengraph-image.tsx). The chapter card carries the number, name, transliteration, an excerpt of the summary, and the verse count, all in the locale being shared. Because `getChapterBySlug()` reads the already-cached chapter list, a card costs no extra API request.

Both routes render through `renderOgCard()` in [`src/lib/og.tsx`](src/lib/og.tsx). Satori — the renderer behind `next/og` — has constraints worth knowing before editing it:

- **No Tailwind, no CSS variables, no `next/font` objects.** The palette is the light half of `globals.css` copied by hand, and the fonts are read as raw `.ttf` buffers from `src/fonts/`. Those files exist for this reason alone; the site itself loads its fonts through `next/font/google`. **If you change a color token in `globals.css`, change it in `og.tsx` too** — nothing links the two.
- **Font order is fallback order.** The Devanagari faces sit last so they catch both Sanskrit titles and the transliteration diacritics (`ṣ`, `ā`) that Marcellus lacks.
- **`ImageResponse` only ever encodes PNG**, whatever the source asset is.
- Titles range from `Karma Yoga` to `क्षेत्रक्षेत्रज्ञविभागयोग`, a single unbreakable compound, so `titleSize()` steps the font size down by length rather than fixing it.
- `excerpt()` trims to a word boundary. Satori supports `lineClamp`, but clamping alone ends the last line mid-word under an ellipsis, which every chapter summary is long enough to hit.

The backdrop is `public/og-plate.jpg`: a parchment field on the left for the type, with the Kurukshetra photograph feathered into the right side. It is a build artifact of `public/pexels-dhruv-jangid-2945224-39362306.jpg` — the `ffmpeg` command that regenerates it is in the doc comment above `PLATE` in [`og.tsx`](src/lib/og.tsx). The alpha ramp in that command is what hides the seam; a hard crop butts the photo against the parchment with a visible edge.

`metadataBase` is resolved at build time, not per request — every page here is prerendered, so a runtime-only origin comes too late. On Vercel it falls back to `VERCEL_PROJECT_PRODUCTION_URL`, so cards work with no configuration; preview deploys advertise the production origin, which is what a canonical URL should say. Anywhere else, set `SITE_URL` before building or the cards will be advertised at `localhost:3000` and every scraper will show a broken image.

### Theming

Light, dark, and system, handled by [`next-themes`](https://github.com/pacocoursey/next-themes) following the [shadcn/ui setup](https://ui.shadcn.com/docs/dark-mode/next).

[`src/components/theme-provider.tsx`](src/components/theme-provider.tsx) wraps `NextThemesProvider`; the root layout mounts it with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, and `disableTransitionOnChange`. `<html>` carries `suppressHydrationWarning` because the theme class is applied by a pre-paint script rather than by React.

next-themes injects that script itself, so there is no flash before paint, and it also sets `color-scheme` on `<html>` so native scrollbars and form controls match the theme.

Colors are CSS custom properties defined completely on `:root`, then redefined under `.dark`. Components use semantic tokens (`bg-surface`, `text-ink`) so most need no `dark:` variants at all. There is deliberately **no `prefers-color-scheme` block** — next-themes resolves the system preference and reflects it in the class, so a media query would override an explicit "light" choice on a dark-mode machine.

[`src/components/theme-toggle.tsx`](src/components/theme-toggle.tsx) is a two-state button (`setTheme` between light and dark) whose icon is chosen by CSS from the `dark` class rather than by React state — no hydration mismatch, no post-mount flicker, so it needs no `mounted` guard. Its label is static (`themeLabel`) for the same reason. For the three-way Light/Dark/System dropdown from the shadcn docs, you would need shadcn's `DropdownMenu` and a `mounted` guard.

Typography: Marcellus for English display, Noto Serif Devanagari for Sanskrit/Hindi, Inter for UI — all loaded through `next/font/google`, which downloads and self-hosts them at build time, so no request leaves for Google's servers. **Never apply letter-spacing to Devanagari**; it breaks conjuncts apart (`श्रीमद्भगवद्गीता` → `श्री म द्भ ग व द्री ता`).

Cards fade in with the `animate-rise` keyframes in [`globals.css`](src/app/globals.css), staggered by index and capped at twelve steps so long verse lists do not accumulate delay. The animation is disabled under `prefers-reduced-motion`.

## Project structure

```
src/
  proxy.ts                    locale redirect (sibling of app/)
  app/
    globals.css               design tokens + theming
    icon.svg                  Om favicon (+ apple-icon.png, favicon.ico)
    [lang]/
      layout.tsx              root layout, fonts, theme, locale params, metadata
      page.tsx                homepage
      error.tsx               API-failure boundary (client)
      not-found.tsx           localised 404 (server)
      opengraph-image.tsx     homepage social card
      chapter/[slug]/
        page.tsx              chapter detail: summary + verses
        opengraph-image.tsx   per-chapter social card
  fonts/                      raw .ttf buffers, for OG rendering only
  lib/
    og.tsx                    shared Satori card: palette, fonts, layout
    gita/api.ts               server-only fetch, slug lookup, translation pick
    gita/types.ts             Chapter, Verse, Translation types
    i18n/config.ts            locales + type guard
    i18n/dictionaries.ts      getDictionary() via next/root-params
    i18n/dictionaries/        en.json, hi.json (UI chrome only)
    i18n/numerals.ts          formatNumber(), Devanagari digits
  components/
    site-header.tsx           sticky bar: wordmark, language switch, theme toggle
    site-hero.tsx             homepage title block (the only <h1> on `/[lang]`)
    site-footer.tsx           Devanagari wordmark, GitHub link
    chapter-grid.tsx          fetches and lays out the 18 cards
    chapter-card.tsx          per-locale field selection, links to the chapter
    verse-list.tsx            verse <ul>
    verse-card.tsx            shloka, transliteration, translation, credit
    language-switch.tsx       client
    theme-toggle.tsx          client
    theme-provider.tsx        client, wraps next-themes
    scroll-to-top.tsx         client, fixed back-to-top button

public/
  og-plate.jpg                1200x630 OG backdrop (generated)
  pexels-...jpg               source photograph for the plate
```

## Notes for contributors

This project runs Next.js 16, which has breaking changes from earlier versions. Version-matched docs ship inside the repo at `node_modules/next/dist/docs/` — read those rather than relying on memory. See `AGENTS.md`.

`error.tsx` is a Client Component, so it cannot use `next/root-params`; it reads the locale from `usePathname()` instead. `not-found.tsx` is a Server Component and reads the locale normally.

`dynamicParams` is deliberately left at its default (`true`) on the chapter route. Setting it to `false` would reject an unknown slug at the routing layer, before the `[lang]` segment renders — so the visitor would get Next's bare global 404 instead of the localised `not-found.tsx`. Letting it render costs nothing, because `getChapterBySlug()` validates against the cached chapter list without touching the API.

Keeping docs current is part of every change — see the rules in `CLAUDE.md`.

### Known warnings

#### `Dynamic filesystem access causes tracing of the whole project`

`next build` reports one warning, pointing at `projectFile()` in [`src/lib/og.tsx`](src/lib/og.tsx):

```
Warning: Dynamic filesystem access causes tracing of the whole project
> 30 | const projectFile = (...segments: string[]) => join(process.cwd(), ...segments);
```

The build succeeds and the cards render correctly, but the spread argument makes the path unanalysable, so Turbopack conservatively traces **every** source file — `public/` included — into the server output. On a size-limited host that is worth fixing: give the helper a statically scoped root (`join(process.cwd(), "src/fonts", name)` and a separate one for the plate) rather than an open-ended segment list, or silence it deliberately with `/*turbopackIgnore: true*/`.

#### Dev-only: `Encountered a script tag while rendering React component`

Switching theme in development can surface:

> Encountered a script tag while rendering React component.

That one is harmless and **dev-only**. `next-themes` renders its pre-paint script as a `<script>` element inside the provider, and React 19 warns whenever the client renders one. The warning lives only in React's `.development.js` builds — production is unaffected, and the toggle works correctly in both. There is no upstream fix as of `next-themes@0.4.6`; the only way to remove it is to stop using `next-themes` and emit the script from the Server Component layout instead.

## Not yet built

- Fuller SEO: sitemap, `robots.txt`, canonical and `hreflang` links
- Logo in the header

`word_meanings` is fetched with each verse but not rendered — the API returns it as a dense semicolon-separated glossary that needs parsing before it is readable.
