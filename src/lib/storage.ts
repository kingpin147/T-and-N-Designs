import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  ListBucketsCommand, 
  CreateBucketCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const region = process.env.AWS_REGION || "ap-southeast-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
export const NEON_STORAGE_BUCKET = process.env.NEON_STORAGE_BUCKET || "assets";

export function getNeonStorageClient(): S3Client | null {
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

/**
 * Uploads an object buffer to Neon Object Storage
 */
export async function uploadToNeonStorage(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<{ success: boolean; key: string; error?: string }> {
  const s3 = getNeonStorageClient();
  if (!s3) {
    return { success: false, key: "", error: "Neon Object Storage credentials not configured." };
  }

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: NEON_STORAGE_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
      { abortSignal: AbortSignal.timeout(10000) }
    );

    return { success: true, key };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload to Neon storage failed";
    console.error("❌ [Neon Storage Upload Error]:", message);
    return { success: false, key: "", error: "Failed to upload asset due to storage timeout or error." };
  }
}

/**
 * Generates a presigned GET URL for an object in Neon Object Storage
 */
export async function getPresignedViewUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
  const s3 = getNeonStorageClient();
  if (!s3) return null;

  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: NEON_STORAGE_BUCKET,
        Key: key,
      }),
      { expiresIn }
    );
  } catch (err) {
    console.error("❌ [Neon Presigned URL Error]:", err);
    return null;
  }
}

/**
 * Fetches an object stream directly from Neon Object Storage for proxy serving
 */
export async function getObjectFromNeonStorage(key: string) {
  const s3 = getNeonStorageClient();
  if (!s3) return null;

  try {
    return await s3.send(
      new GetObjectCommand({
        Bucket: NEON_STORAGE_BUCKET,
        Key: key,
      }),
      { abortSignal: AbortSignal.timeout(10000) }
    );
  } catch (err) {
    console.error("❌ [Neon GetObject Error]:", err);
    return null;
  }
}
