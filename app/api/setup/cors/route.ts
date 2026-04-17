import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/storage";
import { auth } from "@/lib/auth";

// GET /api/setup/cors — R2 bucket дээр S3 CORS policy тохируулна (нэг удаа)
export async function GET() {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;
  if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  await r2.send(
    new PutBucketCorsCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [
              "http://localhost:3000",
              "https://contentweb-iota.vercel.app",
            ],
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  );

  return Response.json({ ok: true, message: "CORS policy set via S3 API" });
}
