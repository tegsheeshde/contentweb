import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { r2, videoKey, thumbnailKey, getUploadSignedUrl } from "@/lib/storage";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.R2_BUCKET_NAME!;
const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB per part

// POST /api/upload/multipart
// action=start   → multipart upload эхлэх, part presigned URLs буцаана
// action=complete → multipart upload дуусгах
export async function POST(request: NextRequest) {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;
  if (!session?.user || !isAdmin) {
    return Response.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  const body = await request.json();

  if (body.action === "start") {
    const { title, description, duration, isPremium, fileSize, contentType } = body;

    if (!title || !duration || !fileSize || !contentType) {
      return Response.json({ error: "Талбар дутуу байна" }, { status: 400 });
    }

    // DB-д бүртгэх
    const video = await db.video.create({
      data: { title, description: description ?? null, duration, isPremium: isPremium ?? true, r2Key: "", thumbnailKey: null },
    });
    const vKey = videoKey(video.id);
    const tKey = thumbnailKey(video.id);
    await db.video.update({ where: { id: video.id }, data: { r2Key: vKey, thumbnailKey: tKey } });

    // Multipart upload эхлэх
    const { UploadId } = await r2.send(
      new CreateMultipartUploadCommand({ Bucket: BUCKET, Key: vKey, ContentType: contentType })
    );

    // Part тус бүрт presigned URL үүсгэх
    const totalParts = Math.ceil(fileSize / CHUNK_SIZE);
    const partUrls = await Promise.all(
      Array.from({ length: totalParts }, async (_, i) => {
        const cmd = new UploadPartCommand({
          Bucket: BUCKET,
          Key: vKey,
          UploadId,
          PartNumber: i + 1,
        });
        const url = await getSignedUrl(r2, cmd, {
          expiresIn: 3600,
          unhoistableHeaders: new Set(["x-amz-checksum-crc32", "x-amz-sdk-checksum-algorithm"]),
        });
        return { partNumber: i + 1, url };
      })
    );

    // Thumbnail presigned URL
    const thumbnailUploadUrl = await getUploadSignedUrl(tKey, "image/jpeg");

    return Response.json({
      videoId: video.id,
      uploadId: UploadId,
      key: vKey,
      partUrls,
      thumbnailUploadUrl,
      chunkSize: CHUNK_SIZE,
    });
  }

  if (body.action === "complete") {
    const { key, uploadId, parts } = body;
    if (!key || !uploadId || !parts) {
      return Response.json({ error: "key, uploadId, parts шаардлагатай" }, { status: 400 });
    }

    try {
      await r2.send(
        new CompleteMultipartUploadCommand({
          Bucket: BUCKET,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: {
            Parts: parts.map((p: { partNumber: number; etag: string }) => ({
              PartNumber: p.partNumber,
              ETag: p.etag,
            })),
          },
        })
      );
      return Response.json({ ok: true });
    } catch (e) {
      // Алдаа гарвал multipart-г цуцлах
      await r2.send(new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId: uploadId })).catch(() => {});
      return Response.json({ error: String(e) }, { status: 500 });
    }
  }

  return Response.json({ error: "Тодорхойгүй action" }, { status: 400 });
}
