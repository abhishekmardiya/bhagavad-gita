import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n/config";

/**
 * The shared shell for every `opengraph-image` route.
 *
 * Satori (which powers `next/og`) does not run Tailwind, read CSS variables or
 * accept `next/font` objects, so the palette below mirrors `globals.css` by
 * hand and the fonts are loaded as raw `.ttf` buffers.
 */

export const OG_SIZE = { width: 1200, height: 630 };

/** `ImageResponse` only ever encodes PNG — there is no JPEG option. */
export const OG_CONTENT_TYPE = "image/png";

/** The light half of the `globals.css` palette. OG previews have no dark mode. */
const palette = {
  parchment: "#f7f2e7",
  ink: "#211a13",
  inkSoft: "#4a3c2e",
  muted: "#7b6a56",
  saffron: "#c2601b",
  saffronSoft: "#e8a05a",
  indigo: "#2f2d63",
};

/**
 * `public/og-plate.jpg` is the 1200×630 backdrop: a parchment field on the left
 * for the type, and the Kurukshetra chariot photograph feathered into it on the
 * right. Regenerate it from the source photograph with:
 *
 * ```sh
 * ffmpeg -y -i public/pexels-dhruv-jangid-2945224-39362306.jpg \
 *   -f lavfi -i color=c=0xF7F2E7:s=1200x630 \
 *   -filter_complex "[0:v]crop=1250:1406:430:1030,scale=560:630:flags=lanczos,\
 * eq=saturation=1.06:contrast=1.03,unsharp=5:5:0.4:5:5:0,format=rgba,\
 * geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*pow(min(X/96,1),1.2)'[photo];\
 * [1:v][photo]overlay=640:0,format=yuvj420p[out]" \
 *   -map "[out]" -frames:v 1 -q:v 2 public/og-plate.jpg
 * ```
 *
 * The `geq` alpha ramp is what hides the seam: the photo's leftmost 96px fade
 * into the parchment instead of butting against it with a hard edge.
 */
const PLATE = "public/og-plate.jpg";

// Neither the plate nor the fonts depend on request data, so they are read once
// at module scope rather than on every generated image.
// Scoped to a literal subfolder on purpose: a fully dynamic `join(cwd(), ...)`
// makes Turbopack trace the entire project into the server bundle.
const font = (file: string) => join(process.cwd(), "src/fonts", file);

const [plateData, marcellus, inter, interSemiBold, deva, devaSemiBold] =
  await Promise.all([
    readFile(join(process.cwd(), PLATE), "base64"),
    readFile(font("Marcellus-Regular.ttf")),
    readFile(font("Inter-Regular.ttf")),
    readFile(font("Inter-SemiBold.ttf")),
    readFile(font("NotoSerifDevanagari-Regular.ttf")),
    readFile(font("NotoSerifDevanagari-SemiBold.ttf")),
  ]);

const plateSrc = `data:image/jpeg;base64,${plateData}`;

/**
 * Order matters: Satori falls through this list for glyphs the requested family
 * is missing, so the Devanagari faces sit last and catch both the Sanskrit
 * titles and the transliteration diacritics (ṣ, ā) that Marcellus lacks.
 */
const fonts = [
  { name: "Marcellus", data: marcellus, weight: 400 as const },
  { name: "Inter", data: inter, weight: 400 as const },
  { name: "Inter", data: interSemiBold, weight: 600 as const },
  { name: "Noto Serif Devanagari", data: deva, weight: 400 as const },
  { name: "Noto Serif Devanagari", data: devaSemiBold, weight: 600 as const },
];

/**
 * Trims to a word boundary. Satori supports `lineClamp`, but clamping alone
 * leaves the last line ending mid-word under an ellipsis, and chapter summaries
 * are long enough that every card would hit it.
 */
function excerpt(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  const cut = trimmed.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * The eyebrow is Sanskrit on the English cards too (श्रीमद्भगवद्गीता), so its
 * styling has to follow the script rather than the locale.
 */
const DEVANAGARI = /[\u0900-\u097F]/;

/**
 * Titles range from "Karma Yoga" to "क्षेत्रक्षेत्रज्ञविभागयोग" — one of which is a
 * single unbreakable Devanagari compound — so the size steps down with length
 * instead of being fixed.
 */
function titleSize(title: string): number {
  if (title.length <= 14) return 68;
  if (title.length <= 22) return 56;
  if (title.length <= 32) return 46;
  return 38;
}

interface OgCardProps {
  locale: Locale;
  /** Small saffron line above the title — the chapter number, or the site name. */
  eyebrow: string;
  title: string;
  /** Romanised Sanskrit, shown only on chapter cards. */
  subtitle?: string;
  /** Summary or tagline. Truncated here, not by the caller. */
  body: string;
  /** Bottom line, e.g. "Bhagavad Gita · 47 verses". */
  footer: string;
}

export function renderOgCard({
  locale,
  eyebrow,
  title,
  subtitle,
  body,
  footer,
}: OgCardProps): ImageResponse {
  const hi = locale === "hi";
  const display = hi ? "Noto Serif Devanagari" : "Marcellus";
  const text = hi ? "Noto Serif Devanagari" : "Inter";
  const devaEyebrow = DEVANAGARI.test(eyebrow);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: palette.parchment,
        fontFamily: text,
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: Satori renders this to a
          PNG on the server — next/image has no meaning inside an OG card. */}
      <img
        src={plateSrc}
        width={OG_SIZE.width}
        height={OG_SIZE.height}
        alt=""
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* Brand edge, carried across the photograph as well as the parchment. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_SIZE.width,
          height: 6,
          background: `linear-gradient(90deg, ${palette.saffron} 0%, ${palette.saffronSoft} 55%, ${palette.indigo} 100%)`,
        }}
      />

      {/* The type column sits entirely inside the parchment field, clear of the
          96px feather that starts at x=640. */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 664,
          height: "100%",
          padding: "0 64px 0 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: devaEyebrow ? "Noto Serif Devanagari" : "Inter",
            fontSize: 20,
            fontWeight: 600,
            color: palette.saffron,
            // Letterspaced small caps read as an ornament in Latin and as a
            // defect in Devanagari: tracking pulls the halant away from its
            // consonant, so श्रीमद्भगवद्गीता decomposes into श् री म द् ...
            ...(devaEyebrow
              ? {}
              : {
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.18em",
                }),
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontFamily: display,
            fontSize: titleSize(title),
            lineHeight: 1.14,
            color: palette.ink,
            wordBreak: "break-word",
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 25,
              color: palette.indigo,
            }}
          >
            {subtitle}
          </div>
        ) : null}

        <div
          style={{
            width: 92,
            height: 3,
            marginTop: 28,
            marginBottom: 26,
            background: `linear-gradient(90deg, ${palette.saffron}, ${palette.saffronSoft})`,
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 22,
            lineHeight: 1.5,
            color: palette.inkSoft,
          }}
        >
          {excerpt(body, subtitle ? 150 : 190)}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 18,
            color: palette.muted,
          }}
        >
          {footer}
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts },
  );
}
