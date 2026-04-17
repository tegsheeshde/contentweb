import { db } from "@/lib/db";
import { getVideoSignedUrl } from "@/lib/storage";
import MovieCard, { type Movie } from "@/components/MovieCard";

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
    },
  });

  return Promise.all(
    videos.map(async (v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      duration: v.duration,
      isPremium: v.isPremium,
      thumbnailUrl: v.thumbnailKey ? await getVideoSignedUrl(v.thumbnailKey) : null,
    }))
  );
}

export const revalidate = 0;

export default async function HomePage() {
  const movies = await getMovies();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-24 px-6 text-center bg-gradient-to-b from-zinc-900 to-zinc-950">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          Монгол контент нэг дор
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mb-8">
          Шилдэг Монгол кино, сериал, баримтат бичлэгийг HD чанартайгаар
          хязгааргүй үзнэ үү.
        </p>
        <a
          href="/subscribe"
          className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full transition-colors"
        >
          Одоо захиалах — 9,900₮/сар
        </a>
      </section>

      {/* Movie Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-semibold mb-6">Онцлох кинонууд</h2>
        {movies.length === 0 ? (
          <p className="text-zinc-500 text-sm">Одоогоор кино байхгүй байна.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
