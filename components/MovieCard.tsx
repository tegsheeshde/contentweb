import Link from "next/link";
import Image from "next/image";

const GRADIENTS = [
  "bg-gradient-to-br from-violet-700 to-purple-900",
  "bg-gradient-to-br from-blue-700 to-cyan-900",
  "bg-gradient-to-br from-rose-700 to-pink-900",
  "bg-gradient-to-br from-amber-600 to-orange-900",
  "bg-gradient-to-br from-emerald-700 to-teal-900",
  "bg-gradient-to-br from-indigo-700 to-blue-900",
  "bg-gradient-to-br from-red-700 to-rose-900",
  "bg-gradient-to-br from-teal-600 to-cyan-900",
];

function placeholderGradient(id: string) {
  const n = id.charCodeAt(id.length - 1) % GRADIENTS.length;
  return GRADIENTS[n];
}

export interface Movie {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: string;
  isPremium: boolean;
  isNew?: boolean;
}

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/watch/${movie.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-zinc-900 aspect-[2/3]">
        {movie.thumbnailUrl ? (
          <Image
            src={movie.thumbnailUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${placeholderGradient(movie.id)}`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            {movie.isPremium ? (
              <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider w-fit">
                PREMIUM
              </span>
            ) : (
              <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md w-fit">
                ҮНЭГҮЙ
              </span>
            )}
            {movie.isNew && (
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md w-fit animate-pulse">
                ШИНЭ
              </span>
            )}
          </div>
          <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0">
            {movie.duration}
          </span>
        </div>

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{movie.title}</h3>
        </div>
      </div>
    </Link>
  );
}
