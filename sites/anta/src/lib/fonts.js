import { preload } from "react-dom";

// Preload only the faces each page paints first (LCP), per language.
const FACES = {
  ar: {
    home: ["amiri-700-title", "plexar-400"],
    write: ["amiri-700-title", "amiri-400-ui", "plexar-400"],
    privacy: ["amiri-700-title", "amiri-400-ui", "plexar-400"]
  },
  en: {
    home: ["news-400", "news-400i", "plexar-400"],
    write: ["news-400", "news-400i", "plexar-400"],
    privacy: ["news-400", "plexar-400"]
  }
};

export function preloadFonts(lang, page) {
  for (const face of (FACES[lang] || FACES.en)[page] || []) {
    preload(`/fonts/${face}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }
}
