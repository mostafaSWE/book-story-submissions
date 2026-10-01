// All books the admin manages. The overview lists them in this order; adding a third book means
// adding its module under src/books/<slug>/ and one line here.
import * as readerToWriter from "./reader-to-writer";
import * as anta from "./anta";

export const BOOKS = [readerToWriter, anta];

export function bookBySlug(slug) {
  return BOOKS.find((b) => b.book.slug === slug) || null;
}
