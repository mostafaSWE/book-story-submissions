import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createAdminSignedImageUrl, RECEIPT_BUCKET, STORY_PAGES_BUCKET } from "@/lib/uploads";

const allowedBuckets = new Set([RECEIPT_BUCKET, STORY_PAGES_BUCKET]);

export async function GET(_request, context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const pathParts = Array.isArray(params.path) ? params.path : [];
  const [bucket, ...objectPathParts] = pathParts;
  const objectPath = objectPathParts.join("/");

  if (!allowedBuckets.has(bucket) || !objectPath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const signedUrl = await createAdminSignedImageUrl({ bucket, path: objectPath });
    if (!signedUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
