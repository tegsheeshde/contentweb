import { db } from "@/lib/db";
import { getVideoSignedUrl } from "@/lib/storage";
import { type Movie } from "@/components/MovieCard";
import MovieRow from "@/components/MovieRow";
import Link from "next/link";
import Image from "next/image";

async function getMovies(): Promise<Movie[]> {
  const videos = await db.video.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      duration: true,
      isPremium: true,
      thumbnailKey: true,
      publishedAt: true as true,
    },
  });

  const now = Date.now();
  return Promise.all(
    videos.map(async (v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      duration: v.duration,
      isPremium: v.isPremium,
      thumbnailUrl: v.thumbnailKey ? await getVideoSignedUrl(v.thumbnailKey) : null,
      isNew: now - new Date(v.publishedAt).getTime() < 7 * 24 * 60 * 60 * 1000,
    }))
  );
}

export const revalidate = 0;

export default async function HomePage() {
  const movies = await getMovies();
  const featured = movies.find((m) => m.thumbnailUrl) ?? movies[0] ?? null;
  const premiumMovies = movies.filter((m) => m.isPremium);
  const freeMovies = movies.filter((m) => !m.isPremium);
  const newMovies = movies.filter((m) => m.isNew);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Cinematic Hero ── */}
      {featured ? (
        <section className="relative min-h-[95vh] flex items-end overflow-hidden">
          {/* Backdrop image */}
          {featured.thumbnailUrl && (
            <Image
              src={featured.thumbnailUrl}
              alt={featured.title}
              fill
              className="object-cover scale-105"
              unoptimized
              priority
            />
          )}
          {!featured.thumbnailUrl && (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />
          )}

          {/* Cinematic overlays */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-24 pt-32 w-full">
            <div className="max-w-xl">
              {featured.isNew && (
                <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Шинэ нэмэгдлээ
                </div>
              )}
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4 drop-shadow-2xl">
                {featured.title}
              </h1>
              {featured.description && (
                <p className="text-zinc-300 text-base leading-relaxed mb-6 line-clamp-3 max-w-md">
                  {featured.description}
                </p>
              )}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-zinc-400 text-sm">{featured.duration}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                {featured.isPremium ? (
                  <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold px-2.5 py-0.5 rounded-md">
                    PREMIUM
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-md">
                    ҮНЭГҮЙ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/watch/${featured.id}`}
                  className="inline-flex items-center gap-2.5 bg-white hover:bg-zinc-200 text-black font-bold py-3 px-7 rounded-full transition-all hover:scale-105 active:scale-95 text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Үзэх
                </Link>
                <Link
                  href="/subscribe"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm text-white font-semibold py-3 px-7 rounded-full transition-all text-sm"
                >
                  Захиалах
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* No movies yet — minimal branded hero */
        <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-yellow-500/8 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-600/8 rounded-full blur-[140px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-yellow-400 text-xs font-semibold tracking-widest uppercase">Монгол Контент Платформ</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none mb-5">
              Монгол кино
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">нэг дор</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-md mx-auto mb-10 leading-relaxed">
              Шилдэг Монгол кино, сериал, баримтат бичлэгийг өндөр чанартайгаар үзнэ үү.
            </p>
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 px-8 rounded-full transition-all hover:scale-105"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              Одоо захиалах — 9,900₮/сар
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </section>
      )}

      {/* ── Movie Rows ── */}
      {movies.length > 0 && (
        <div className="pb-20 -mt-2">
          {newMovies.length > 0 && (
            <MovieRow
              title="Шинээр нэмэгдсэн"
              subtitle="Сүүлийн 7 хоногт"
              movies={newMovies}
            />
          )}
          {premiumMovies.length > 0 && (
            <MovieRow
              title="Premium кинонууд"
              subtitle={`${premiumMovies.length} кино`}
              movies={premiumMovies}
              action={
                <Link href="/subscribe" className="text-yellow-500 hover:text-yellow-400 text-xs font-semibold transition-colors mr-2">
                  Захиалах →
                </Link>
              }
            />
          )}
          {freeMovies.length > 0 && (
            <MovieRow
              title="Үнэгүй үзэх"
              subtitle={`${freeMovies.length} кино`}
              movies={freeMovies}
            />
          )}
          {movies.length > 4 && (
            <MovieRow
              title="Бүх кинонууд"
              subtitle={`${movies.length} нийт`}
              movies={movies}
            />
          )}
        </div>
      )}

      {movies.length === 0 && (
        <div className="max-w-7xl mx-auto px-10 pb-20 text-center py-16 text-zinc-700">
          <p className="text-sm">Одоогоор кино байхгүй байна</p>
        </div>
      )}
    </main>
  );
}
