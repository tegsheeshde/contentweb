"use client";

interface VideoPlayerProps {
  signedUrl: string;
  title: string;
  posterUrl?: string;
}

export default function VideoPlayer({ signedUrl, title, posterUrl }: VideoPlayerProps) {
  return (
    <div className="plyr-wrapper">
      <video
        src={signedUrl}
        poster={posterUrl}
        controls
        playsInline
        preload="metadata"
        aria-label={title}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" }}
        onError={(e) => {
          const err = e.currentTarget.error;
          console.error("Video error code:", err?.code, "message:", err?.message);
        }}
      />
    </div>
  );
}
