import { NextRequest } from "next/server";
import { uploadToNeonStorage } from "@/lib/storage";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeString } from "@/validations/common";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return apiError("Unauthorized to upload media.", 401);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "portfolio";
    const folder = sanitizeString(rawFolder, 30) || "portfolio";

    if (!file) {
      return apiError("No file provided for upload.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("File exceeds maximum allowed size (15MB).", 400);
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      return apiError("Unsupported file type. Please upload a PNG, JPEG, WebP, GIF, or SVG image.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(0, 80);
    const key = `${folder}/${Date.now()}-${cleanName}`;

    const uploadRes = await uploadToNeonStorage(key, buffer, mimeType);

    if (!uploadRes.success) {
      return apiError("Failed to store uploaded media. Please try again.", 500);
    }

    return apiSuccess({
      url: `/api/media/${key}`,
      key,
      message: "Media uploaded successfully.",
    }, 201);
  } catch (err: unknown) {
    return handleApiError(err, "An error occurred while uploading file.");
  }
}
