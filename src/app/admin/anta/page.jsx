import { requireAdmin } from "@/lib/auth";
import AntaList from "@/books/anta/ListView";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  await requireAdmin();
  return <AntaList searchParams={await searchParams} />;
}
