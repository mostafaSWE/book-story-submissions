import { requireAdmin } from "@/lib/auth";
import { csvResponse, toCsv } from "@/admin/csv";
import { csvColumns, csvRow, list } from "@/books/reader-to-writer";

// «كتاب من قارئ إلى كاتب» CSV: same columns and filters as before, now Excel-safe (BOM, line breaks, formula guard).
export async function GET(request) {
  await requireAdmin();
  const url = new URL(request.url);
  const rows = await list(Object.fromEntries(url.searchParams.entries()));
  return csvResponse(toCsv(csvColumns, rows.map(csvRow)), `submissions-${new Date().toISOString().slice(0, 10)}.csv`);
}
