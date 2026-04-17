import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteVideo } from "@/lib/storage";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;
  if (!isAdmin) return Response.json({ error: "Зөвшөөрөлгүй" }, { status: 403 });

  const { id } = await params;

  const video = await db.video.findUnique({ where: { id } });
  if (!video) return Response.json({ error: "Олдсонгүй" }, { status: 404 });

  // R2-с устгах
  await deleteVideo(video.r2Key).catch(() => {});
  if (video.thumbnailKey) await deleteVideo(video.thumbnailKey).catch(() => {});

  // DB-с устгах
  await db.video.delete({ where: { id } });

  return Response.json({ ok: true });
}
