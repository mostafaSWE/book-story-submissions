import { requireAdmin } from "@/lib/auth";
import { csvResponse, toCsv } from "@/admin/csv";
import { csvColumns, csvRow, listForExport } from "@/books/anta";

// «أنت الكاتب» CSV: follows the list filters; ?status=selected is the "Export selected" button.
export async function GET(request) {
  await requireAdmin();
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const rows = await listForExport(params);
  const suffix = params.status === "selected" ? "selected" : "contributions";
  return csvResponse(toCsv(csvColumns, rows.map(csvRow)), `anta-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`);
}
