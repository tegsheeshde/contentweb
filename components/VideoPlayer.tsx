"use client";

import { useEffect, useRef } from "react";
import "plyr/dist/plyr.css";

// Plyr uses `export =` (CommonJS), so we type the ref manually
interface PlyrInstance {
  destroy: () => void;
  source: {
    type: string;
    title?: string;
    sources: { src: string; type: string }[];
    poster?: string;
  };
}

interface VideoPlayerProps {
  signedUrl: string;
  title: string;
  posterUrl?: string;
}

export default function VideoPlayer({ signedUrl, title, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<PlyrInstance | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Dynamic import avoids SSR issues and resolves the CJS constructor correctly
    import("plyr").then((mod) => {
      if (!videoRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Plyr = (mod as any).default ?? mod;
      playerRef.current = new Plyr(videoRef.current, {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "fullscreen",
        ],
        fullscreen: {
          enabled: true,
          fallback: true,
          iosNative: true,
        },
        resetOnEnd: false,
        invertTime: false,
        toggleInvert: false,
      }) as PlyrInstance;
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  // Update source when URL changes without destroying the player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.source = {
      type: "video",
      title,
      sources: [{ src: signedUrl, type: "video/mp4" }],
      poster: posterUrl,
    };
  }, [signedUrl, title, posterUrl]);

  return (
    <div className="plyr-wrapper">
      <video
        ref={videoRef}
        playsInline
        poster={posterUrl}
        preload="metadata"
        aria-label={title}
        onError={(e) => console.error("Video error:", e.currentTarget.error)}
      >
        <source src={signedUrl} type="video/mp4" />
      </video>
    </div>
  );
}
