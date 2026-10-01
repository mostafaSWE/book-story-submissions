import { requireAdmin } from "@/lib/auth";
import AntaDetail from "@/books/anta/DetailView";

export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }) {
  await requireAdmin();
  return <AntaDetail params={await params} searchParams={await searchParams} />;
}
