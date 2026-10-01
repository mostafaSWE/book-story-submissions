import { requireAdmin } from "@/lib/auth";
import ReaderToWriterList from "@/books/reader-to-writer/ListView";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  await requireAdmin();
  return <ReaderToWriterList searchParams={await searchParams} />;
}
