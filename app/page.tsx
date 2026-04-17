import MovieCard, { type Movie } from "@/components/MovieCard";

const MOCK_MOVIES: Movie[] = [
  {
    id: "1",
    title: "Хөгжмийн дуран",
    description: "Монгол залуу хөгжимчний амьдралын тухай үнэн түүх.",
    thumbnailUrl: "/thumbnails/movie1.jpg",
    duration: "1:42:00",
    isPremium: false,
  },
  {
    id: "2",
    title: "Говийн нар",
    description: "Говь нутагт өрнөх хайр дурлалын романтик кино.",
    thumbnailUrl: "/thumbnails/movie2.jpg",
    duration: "1:55:30",
    isPremium: true,
  },
  {
    id: "3",
    title: "Нууц замын баатар",
    description: "Туршлагатай тагнуулч тулалдааны хурцадмал боломж.",
    thumbnailUrl: "/thumbnails/movie3.jpg",
    duration: "2:10:15",
    isPremium: true,
  },
  {
    id: "4",
    title: "Хотын дуу чимээ",
    description: "Улаанбаатарын залуучуудын хошин шог комеди кино.",
    thumbnailUrl: "/thumbnails/movie4.jpg",
    duration: "1:28:45",
    isPremium: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center py-24 px-6 text-center bg-gradient-to-b from-zinc-900 to-zinc-950">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_MOVIES.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
