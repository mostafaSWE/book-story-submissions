import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { escapeCsv } from "@/lib/admin-queries";
import { parseFileMeta, parseFileMetaList } from "@/lib/uploads";
import { listSubmissions } from "@/lib/submissions";

export async function GET(request) {
  await requireAdmin();

  const url = new URL(request.url);
  const submissions = await listSubmissions(Object.fromEntries(url.searchParams.entries()));

  const rows = [
    [
      "id",
      "selected_language",
      "full_name",
      "phone_number",
      "email",
      "country",
      "country_code",
      "receipt_image",
      "story_text",
      "story_images",
      "accepted_terms",
      "accepted_terms_at",
      "created_at",
      "updated_at"
    ]
  ];

  for (const submission of submissions) {
    const receipt = parseFileMeta(submission.receiptImage);
    const storyImages = parseFileMetaList(submission.storyImages);

    rows.push([
      submission.id,
      submission.selectedLanguage,
      submission.fullName,
      submission.phoneNumber,
      submission.email,
      submission.country,
      submission.countryCode,
      receipt?.originalName || "",
      submission.storyText || "",
      storyImages.map((image) => image.originalName).join("; "),
      submission.acceptedTerms ? "true" : "false",
      submission.acceptedTermsAt ? submission.acceptedTermsAt.toISOString() : "",
      submission.createdAt.toISOString(),
      submission.updatedAt.toISOString()
    ]);
  }

  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="submissions-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
