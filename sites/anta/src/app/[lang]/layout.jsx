import { preload } from "react-dom";
import "../globals.css";
import { DEFAULT_LOCALE, LOCALES, SITE_URL, getMessages } from "@/lib/i18n";

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Faces each language paints first; everything else loads on demand.
const PRELOAD = {
  ar: ["amiri-700", "amiri-400", "plexar-400"],
  en: ["news-400", "news-400i", "plexar-400"]
};

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const m = getMessages(lang);
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `/${l}`]));
  languages["x-default"] = `/${DEFAULT_LOCALE}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: m.docTitle,
    description: m.docDescription,
    alternates: { canonical: `/${lang}`, languages },
    openGraph: {
      type: "website",
      siteName: m.title,
      title: m.docTitle,
      description: m.docDescription,
      url: `/${lang}`,
      locale: m.meta.ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => getMessages(l).meta.ogLocale),
      images: [{ url: `/og/${lang}.jpg`, width: 1200, height: 630, alt: m.title }]
    },
    twitter: { card: "summary_large_image", title: m.docTitle, description: m.docDescription, images: [`/og/${lang}.jpg`] },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] }
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F3EDE2",
  colorScheme: "light"
};

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  const m = getMessages(lang);
  for (const face of PRELOAD[lang] || PRELOAD.en) {
    preload(`/fonts/${face}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }
  return (
    <html lang={lang} dir={m.meta.dir}>
      <body>
        <a className="skip" href="#main">{m.skip}</a>
        {children}
      </body>
    </html>
  );
}
