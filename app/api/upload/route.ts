import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { r2, videoKey, thumbnailKey } from "@/lib/storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const maxDuration = 60;

// POST /api/upload — metadata + file дамжуулан upload
export async function POST(request: NextRequest) {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;
  if (!session?.user || !isAdmin) {
    return Response.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  const form = await request.formData();
  const title = form.get("title") as string;
  const description = (form.get("description") as string) || null;
  const duration = form.get("duration") as string;
  const isPremium = form.get("isPremium") === "true";
  const videoFile = form.get("video") as File | null;
  const thumbFile = form.get("thumbnail") as File | null;

  if (!title || !duration || !videoFile) {
    return Response.json({ error: "title, duration, video шаардлагатай" }, { status: 400 });
  }

  const video = await db.video.create({
    data: {
      title,
      description,
      duration,
      isPremium,
      r2Key: "",
      thumbnailKey: null,
    },
  });

  const vKey = videoKey(video.id);
  const tKey = thumbnailKey(video.id);

  // Видео R2-д upload
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: vKey,
      Body: Buffer.from(await videoFile.arrayBuffer()),
      ContentType: videoFile.type || "video/mp4",
    })
  );

  // Thumbnail upload (хэрэв байвал)
  if (thumbFile) {
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: tKey,
        Body: Buffer.from(await thumbFile.arrayBuffer()),
        ContentType: thumbFile.type || "image/jpeg",
      })
    );
  }

  await db.video.update({
    where: { id: video.id },
    data: { r2Key: vKey, thumbnailKey: thumbFile ? tKey : null },
  });

  return Response.json({ id: video.id, title }, { status: 201 });
}
