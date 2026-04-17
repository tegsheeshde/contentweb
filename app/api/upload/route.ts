import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUploadSignedUrl, videoKey, thumbnailKey } from "@/lib/storage";

// POST /api/upload — metadata хадгалж presigned URL буцаана
export async function POST(request: NextRequest) {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;
  if (!session?.user || !isAdmin) {
    return Response.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.duration || !body?.contentType) {
    return Response.json({ error: "title, duration, contentType шаардлагатай" }, { status: 400 });
  }

  const video = await db.video.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      duration: body.duration,
      isPremium: body.isPremium ?? true,
      r2Key: "",
      thumbnailKey: null,
    },
  });

  const vKey = videoKey(video.id);
  const tKey = thumbnailKey(video.id);

  await db.video.update({
    where: { id: video.id },
    data: { r2Key: vKey, thumbnailKey: tKey },
  });

  const videoContentType = body.contentType || "video/mp4";
  const thumbContentType = body.thumbnailContentType || "image/jpeg";

  const [uploadUrl, thumbnailUploadUrl] = await Promise.all([
    getUploadSignedUrl(vKey, videoContentType),
    getUploadSignedUrl(tKey, thumbContentType),
  ]);

  return Response.json({
    videoId: video.id,
    uploadUrl,
    thumbnailUploadUrl,
    videoContentType,
    thumbContentType,
  }, { status: 201 });
}
