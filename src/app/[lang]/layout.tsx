import type { Metadata } from "next";
import { Inter, Marcellus, Noto_Serif_Devanagari } from "next/font/google";
import { lang } from "next/root-params";
import { ThemeProvider } from "@/components/theme-provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
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

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: `${dict.siteName} — ${dict.chaptersHeading}`,
    description: dict.tagline,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
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
        </ThemeProvider>
      </body>
    </html>
  );
}
