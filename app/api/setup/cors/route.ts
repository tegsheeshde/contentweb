import { PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/storage";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;
  if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Одоогийн CORS-г унших
    const current = await r2.send(
      new GetBucketCorsCommand({ Bucket: process.env.R2_BUCKET_NAME! })
    );

    // CORS тохируулах
    await r2.send(
      new PutBucketCorsCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: ["*"],
              AllowedMethods: ["GET", "PUT", "HEAD", "POST", "DELETE"],
              AllowedHeaders: ["*"],
              ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
              MaxAgeSeconds: 86400,
            },
          ],
        },
      })
    );

    return Response.json({ ok: true, previous: current.CORSRules });
  } catch (e) {
    console.error("[setup/cors]", e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
