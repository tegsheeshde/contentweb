"use client";

import { useRef, useState } from "react";

interface VideoPlayerProps {
  signedUrl: string;
  title: string;
  posterUrl?: string;
}

export default function VideoPlayer({ signedUrl, title, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        src={signedUrl}
        poster={posterUrl}
        className="w-full h-full"
        controls
        crossOrigin="anonymous"
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={(e) => console.error("Video error:", e.currentTarget.error)}
        aria-label={title}
      />
    </div>
  );
}
