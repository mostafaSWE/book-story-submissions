import { notFound } from "next/navigation";

// Any unknown path under /ar or /en renders the site's own 404 (with its layout and language).
export default function Rest() {
  notFound();
}
