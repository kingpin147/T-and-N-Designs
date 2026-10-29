import { NextRequest, NextResponse } from "next/server";
import { getObjectFromNeonStorage } from "@/lib/storage";
import { Readable } from "node:stream";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const key = resolvedParams.key.join("/");

    if (!key) {
      return new NextResponse("Key required", { status: 400 });
    }

    const objectOutput = await getObjectFromNeonStorage(key);
    if (!objectOutput || !objectOutput.Body) {
      return new NextResponse("Media not found in Neon storage", { status: 404 });
    }

    // Convert AWS SDK stream to Web ReadableStream
    const contentType = objectOutput.ContentType || "image/png";
    const bodyStream = objectOutput.Body as any;

    return new Response(bodyStream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": objectOutput.ETag || "",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Media fetch error";
    console.error("❌ Media proxy error:", message);
    return new NextResponse("Failed to retrieve media", { status: 500 });
  }
}
