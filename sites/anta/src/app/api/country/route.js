import { cloudflare } from "@/lib/cloudflare";

// Visitor's country (from Cloudflare) so the phone picker can default to it (D8).
export async function GET(request) {
  const country = String(cloudflare().cf?.country || request.headers.get("cf-ipcountry") || "").toUpperCase();
  return Response.json(
    { country: /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
