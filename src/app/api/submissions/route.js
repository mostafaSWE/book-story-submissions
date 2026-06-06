import { NextResponse } from "next/server";
import { getCopy } from "@/lib/i18n";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeSubmissionFields, validateImageFile, isUploadedFile } from "@/lib/validation";
import { removeSavedFiles, saveImageFile } from "@/lib/uploads";
import { createSubmission, findDuplicateSubmission, isUniqueConstraintError } from "@/lib/submissions";

function getClientKey(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return `submission:${ip}`;
}

export async function POST(request) {
  let formData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: getCopy("en").genericError }, { status: 400 });
  }

  const { values, errors, copy } = normalizeSubmissionFields(formData);

  if (!checkRateLimit(getClientKey(request))) {
    return NextResponse.json({ error: copy.genericError }, { status: 429 });
  }

  if (values.honeypot) {
    return NextResponse.json({ error: copy.genericError }, { status: 400 });
  }

  const receiptImage = formData.get("receiptImage");
  const storyImages = formData.getAll("storyImages").filter(isUploadedFile);

  const receiptError = validateImageFile(receiptImage, copy, copy.receiptRequired);
  if (receiptError) errors.receiptImage = receiptError;

  if (storyImages.length > 3) {
    errors.storyImages = copy.maxImages;
  }

  for (const image of storyImages) {
    const imageError = validateImageFile(image, copy);
    if (imageError) {
      errors.storyImages = imageError;
      break;
    }
  }

  if (!values.storyText && storyImages.length === 0) {
    errors.storyText = copy.storyRequired;
  }

  if (Object.keys(errors).length) {
    return NextResponse.json({ error: copy.fixErrors, fieldErrors: errors }, { status: 400 });
  }

  const duplicate = await findDuplicateSubmission({ phoneNumber: values.phoneNumber, email: values.email });

  if (duplicate) {
    return NextResponse.json({ error: copy.duplicate }, { status: 409 });
  }

  const savedFiles = [];

  try {
    const savedReceipt = await saveImageFile(receiptImage, "receipt");
    savedFiles.push(savedReceipt);

    const savedStoryImages = [];
    for (const image of storyImages) {
      const savedImage = await saveImageFile(image, "story");
      savedStoryImages.push(savedImage);
      savedFiles.push(savedImage);
    }

    await createSubmission({
      ...values,
      receiptImage: savedReceipt,
      storyImages: savedStoryImages
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await removeSavedFiles(savedFiles);

    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: copy.duplicate }, { status: 409 });
    }

    console.error("Submission failed", error);
    return NextResponse.json({ error: copy.genericError }, { status: 500 });
  }
}
