import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVideoSignedUrl } from "@/lib/storage";
import VideoPlayer from "@/components/VideoPlayer";
import Paywall from "@/components/Paywall";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const isSubscribed = (session?.user as { subscribed?: boolean })?.subscribed ?? false;

  const video = await db.video.findUnique({ where: { id } });

  if (!video) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Кино олдсонгүй</p>
      </div>
    );
  }

  const canWatch = !video.isPremium || isSubscribed;

  const signedUrl = canWatch ? await getVideoSignedUrl(video.r2Key) : null;
  const thumbnailUrl = video.thumbnailKey
    ? await getVideoSignedUrl(video.thumbnailKey)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">{video.title}</h1>

        {signedUrl ? (
          <>
            <VideoPlayer
              signedUrl={signedUrl}
              title={video.title}
              posterUrl={thumbnailUrl ?? undefined}
            />
            {video.description && (
              <p className="mt-4 text-zinc-400">{video.description}</p>
            )}
          </>
        ) : (
          <Paywall movieTitle={video.title} />
        )}
      </div>
    </div>
  );
}
