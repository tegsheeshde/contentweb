import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { r2 } from "@/lib/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  const isSubscribed = (session?.user as { subscribed?: boolean })?.subscribed ?? false;
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;

  const video = await db.video.findUnique({ where: { id } });
  if (!video) return new Response("Not found", { status: 404 });

  const canWatch = !video.isPremium || isSubscribed || isAdmin;
  if (!canWatch) return new Response("Forbidden", { status: 403 });

  const range = request.headers.get("range");

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: video.r2Key,
    ...(range ? { Range: range } : {}),
  });

  const r2Response = await r2.send(command);

  const headers: Record<string, string> = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  };

  if (r2Response.ContentLength != null) {
    headers["Content-Length"] = String(r2Response.ContentLength);
  }
  if (range && r2Response.ContentRange) {
    headers["Content-Range"] = r2Response.ContentRange;
  }

  return new Response(r2Response.Body as ReadableStream, {
    status: range ? 206 : 200,
    headers,
  });
}
