import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

export const metadata = {
  title: "كتاب من قارئ إلى كاتب",
  description: "A multilingual story submission website for the book project.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
