import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "tnn-designs-media";
const publicDomain = process.env.R2_PUBLIC_DOMAIN || "https://media.tnndesigns.com";

export function getR2Client(): S3Client | null {
  if (!accountId || !accessKeyId || !secretAccessKey || accountId.includes("YOUR_")) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<{ success: boolean; url: string; error?: string }> {
  const s3 = getR2Client();
  if (!s3) {
    return {
      success: false,
      url: "",
      error: "Cloudflare R2 credentials not configured in environment.",
    };
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    await s3.send(command);
    const cleanDomain = publicDomain.replace(/\/+$/, "");
    const publicUrl = `${cleanDomain}/${key}`;

    return {
      success: true,
      url: publicUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "R2 upload failed";
    console.error("❌ [Cloudflare R2 Upload Error]:", message);
    return {
      success: false,
      url: "",
      error: message,
    };
  }
}
