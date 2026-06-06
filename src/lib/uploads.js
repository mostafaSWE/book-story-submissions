import { getSupabaseAdminClient } from "@/lib/supabase-server";

export const RECEIPT_BUCKET = "receipts";
export const STORY_PAGES_BUCKET = "story-pages";

const mimeExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif"
};

function bucketForPrefix(prefix) {
  return prefix === "receipt" ? RECEIPT_BUCKET : STORY_PAGES_BUCKET;
}

function encodeStoragePath(file) {
  const bucket = encodeURIComponent(file.bucket);
  const path = String(file.path || file.storedName || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${bucket}/${path}`;
}

export async function saveImageFile(file, prefix) {
  const supabase = getSupabaseAdminClient();
  const bucket = bucketForPrefix(prefix);
  const extension = mimeExtensions[file.type] || "img";
  const storedName = `${prefix}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const storagePath = `${new Date().toISOString().slice(0, 10)}/${storedName}`;

  const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    contentType: file.type,
    upsert: false
  });

  if (error) throw error;

  return {
    bucket,
    path: storagePath,
    storedName,
    originalName: String(file.name || "image").slice(0, 180),
    mimeType: file.type,
    size: file.size
  };
}

export async function removeSavedFiles(files) {
  const supabase = getSupabaseAdminClient();
  const grouped = new Map();

  for (const file of files.filter(Boolean)) {
    const bucket = file.bucket || RECEIPT_BUCKET;
    const path = file.path || file.storedName;
    if (!path) continue;
    grouped.set(bucket, [...(grouped.get(bucket) || []), path]);
  }

  await Promise.all(
    [...grouped.entries()].map(async ([bucket, paths]) => {
      await supabase.storage.from(bucket).remove(paths);
    })
  );
}

export function parseFileMeta(value) {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function parseFileMetaList(value) {
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function adminFileUrl(file) {
  return `/api/admin/files/${encodeStoragePath(file)}`;
}

export async function createAdminSignedImageUrl(file, expiresIn = 300) {
  const supabase = getSupabaseAdminClient();
  const bucket = file.bucket;
  const path = file.path || file.storedName;
  if (!bucket || !path) return null;

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data?.signedUrl || null;
}
