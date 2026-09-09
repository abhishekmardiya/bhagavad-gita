import type { Metadata } from "next";
import { Inter, Marcellus, Noto_Serif_Devanagari } from "next/font/google";
import { lang } from "next/root-params";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ThemeProvider } from "@/components/theme-provider";
import { locales } from "@/lib/i18n/config";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import "../globals.css";

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  variable: "--font-noto-serif-deva",
  subsets: ["devanagari", "latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Declared on the layout, not on the homepage, so that nested routes such as
// /[lang]/chapter/[slug] inherit these locales and prerender for each of them.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * `og:image` and friends must be absolute. Left unset, Next falls back to
 * localhost with a build warning, which would ship unreachable preview URLs.
 * Server-only, so it is deliberately not `NEXT_PUBLIC_`.
 */
const metadataBase = new URL(process.env.SITE_URL ?? "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const title = `${dict.siteName} — ${dict.chaptersHeading}`;

  // The opengraph-image route is picked up by file convention; only the text
  // has to be declared here.
  return {
    metadataBase,
    title,
    description: dict.tagline,
    openGraph: {
      type: "website",
      siteName: dict.siteName,
      locale: locale === "hi" ? "hi_IN" : "en_US",
      title,
      description: dict.tagline,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.tagline,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const dict = await getDictionary();

  return (
    <html
      lang={await lang()}
      suppressHydrationWarning
      className={`${marcellus.variable} ${notoSerifDevanagari.variable} ${inter.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Fixed overlay, so it sits outside the page flow. */}
          <ScrollToTop label={dict.scrollToTopLabel} />
        </ThemeProvider>
      </body>
    </html>
  );
}
