import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVideoSignedUrl } from "@/lib/storage";
import VideoPlayer from "@/components/VideoPlayer";
import Paywall from "@/components/Paywall";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const isSubscribed = (session?.user as { subscribed?: boolean })?.subscribed ?? false;
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;

  const video = await db.video.findUnique({ where: { id } });

  if (!video) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Кино олдсонгүй</p>
          <Link href="/" className="text-yellow-500 hover:text-yellow-400 text-sm transition-colors">← Нүүр хуудас</Link>
        </div>
      </div>
    );
  }

  const canWatch = !video.isPremium || isSubscribed || isAdmin;

  const streamUrl = canWatch ? `/api/stream/${video.id}` : null;
  const thumbnailUrl = video.thumbnailKey
    ? await getVideoSignedUrl(video.thumbnailKey)
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Full-width video area */}
      <div className="bg-black">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-6">
          {streamUrl ? (
            <VideoPlayer signedUrl={streamUrl} title={video.title} posterUrl={thumbnailUrl ?? undefined} />
          ) : (
            <div className="aspect-video relative rounded-xl overflow-hidden bg-zinc-950">
              {thumbnailUrl && (
                <Image src={thumbnailUrl} alt={video.title} fill className="object-cover opacity-40" unoptimized />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Paywall movieTitle={video.title} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movie info */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              {thumbnailUrl && (
                <div className="hidden md:block relative w-24 h-36 rounded-lg overflow-hidden shrink-0 shadow-2xl">
                  <Image src={thumbnailUrl} alt={video.title} fill className="object-cover" unoptimized />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-black mb-2">{video.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-zinc-400 text-sm">{video.duration}</span>
                  {video.isPremium ? (
                    <span className="bg-yellow-500 text-black text-xs font-black px-2.5 py-0.5 rounded-md tracking-wider">
                      PREMIUM
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-md">
                      ҮНЭГҮЙ
                    </span>
                  )}
                </div>
              </div>
            </div>

            {video.description && (
              <p className="text-zinc-400 leading-relaxed max-w-2xl">{video.description}</p>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-6 text-zinc-500 hover:text-white text-sm transition-colors group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
