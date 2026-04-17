import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVideoSignedUrl, thumbnailKey, videoKey } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const session = await auth();
  const isSubscribed = (session?.user as { subscribed?: boolean })?.subscribed ?? false;

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (id) {
    const video = await db.video.findUnique({ where: { id } });
    if (!video) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    if (video.isPremium && !isSubscribed) {
      return Response.json({ error: "Subscription required" }, { status: 403 });
    }
    const signedUrl = await getVideoSignedUrl(video.r2Key);
    const thumbnailUrl = video.thumbnailKey
      ? await getVideoSignedUrl(video.thumbnailKey)
      : null;

    return Response.json({ ...video, signedUrl, thumbnailUrl });
  }

  // List — no signed URLs, just metadata
  const videos = await db.video.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      duration: true,
      isPremium: true,
      thumbnailKey: true,
      publishedAt: true,
    },
  });

  const withThumbnails = await Promise.all(
    videos.map(async (v) => ({
      ...v,
      thumbnailUrl: v.thumbnailKey ? await getVideoSignedUrl(v.thumbnailKey) : null,
    }))
  );

  return Response.json(withThumbnails);
}
