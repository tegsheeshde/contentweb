import Link from "next/link";
import Image from "next/image";

export interface Movie {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: string;
  isPremium: boolean;
}

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/watch/${movie.id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-zinc-800 aspect-video">
        {movie.thumbnailUrl ? (
          <Image
            src={movie.thumbnailUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
        {movie.isPremium && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
            PREMIUM
          </span>
        )}
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {movie.duration}
        </span>
      </div>
      <div className="mt-2">
        <h3 className="text-white font-medium text-sm line-clamp-1">{movie.title}</h3>
        {movie.description && (
          <p className="text-zinc-400 text-xs line-clamp-2 mt-0.5">{movie.description}</p>
        )}
      </div>
    </Link>
  );
}
