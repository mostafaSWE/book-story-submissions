import { notFound } from "next/navigation";
import "../globals.css";
import { DEFAULT_LOCALE, LOCALES, SITE_URL, getMessages, isLocale } from "@/lib/i18n";

// Prerendered at build; if the prerendered copy is ever missing, render on demand instead of 404.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

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
  if (!isLocale(lang)) notFound(); // e.g. /fr
  const m = getMessages(lang);
  return (
    <html lang={lang} dir={m.meta.dir}>
      <body>
        <a className="skip" href="#main">{m.skip}</a>
        {children}
      </body>
    </html>
  );
}
