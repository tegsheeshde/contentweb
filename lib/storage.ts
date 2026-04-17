import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const BUCKET = process.env.R2_BUCKET_NAME!;
// r2.dev public URL (free) — e.g. https://pub-abc123.r2.dev
// OR custom domain — e.g. https://cdn.yourdomain.com
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Видео үзэх URL — public bucket байвал шууд URL, үгүй бол presigned
export async function getVideoSignedUrl(key: string): Promise<string> {
  if (PUBLIC_URL) {
    return `${PUBLIC_URL}/${key}`;
  }
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}

// Upload presigned URL — admin видео upload хийх (10 минут хүчинтэй)
export async function getUploadSignedUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 600 });
}

export async function deleteVideo(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export function videoKey(videoId: string) {
  return `videos/${videoId}.mp4`;
}

export function thumbnailKey(videoId: string) {
  return `thumbnails/${videoId}.jpg`;
}
