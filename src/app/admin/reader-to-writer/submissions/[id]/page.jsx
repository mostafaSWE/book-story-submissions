import { requireAdmin } from "@/lib/auth";
import ReaderToWriterDetail from "@/books/reader-to-writer/DetailView";

export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }) {
  await requireAdmin();
  return <ReaderToWriterDetail params={await params} searchParams={await searchParams} />;
}
