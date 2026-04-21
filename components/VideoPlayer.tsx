"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  signedUrl: string;
  title: string;
  posterUrl?: string;
}

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ signedUrl, title, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const scheduleHide = useCallback((isPlaying: boolean) => {
    clearTimeout(hideTimer.current);
    setShowControls(true);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // Track fullscreen changes (standard + webkit)
  useEffect(() => {
    const onChange = () => {
      const fs =
        !!document.fullscreenElement ||
        !!(document as { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      setIsFullscreen(fs);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.pause();
    else v.play();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    v.muted = val === 0;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    if (!isFullscreen) {
      // iOS Safari requires webkitEnterFullscreen on the video element itself
      if (typeof (video as { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen === "function") {
        (video as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
      } else if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (typeof (container as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen === "function") {
        (container as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (typeof (document as { webkitExitFullscreen?: () => void }).webkitExitFullscreen === "function") {
        (document as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
      }
    }
  };

  const played = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden aspect-video select-none"
      onMouseMove={() => scheduleHide(playing)}
      onTouchStart={() => scheduleHide(playing)}
    >
      <video
        ref={videoRef}
        src={signedUrl}
        poster={posterUrl}
        className="w-full h-full"
        playsInline
        preload="metadata"
        onPlay={() => { setPlaying(true); scheduleHide(true); }}
        onPause={() => { setPlaying(false); setShowControls(true); clearTimeout(hideTimer.current); }}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(videoRef.current?.duration ?? 0)}
        onProgress={() => {
          const v = videoRef.current;
          if (v?.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
        }}
        onVolumeChange={() => {
          const v = videoRef.current;
          if (!v) return;
          setVolume(v.volume);
          setMuted(v.muted);
        }}
        onError={(e) => console.error("Video error:", e.currentTarget.error)}
        aria-label={title}
        onClick={togglePlay}
      />

      {/* Center play/pause tap target */}
      <button
        className="absolute inset-0 flex items-center justify-center focus:outline-none"
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
      >
        {!playing && (
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
      </button>

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        <div className="relative px-3 pb-3 space-y-2" onClick={(e) => e.stopPropagation()}>
          {/* Progress bar */}
          <div className="relative h-4 flex items-center cursor-pointer">
            <div className="absolute w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="absolute h-full bg-white/30 rounded-full" style={{ width: `${bufferedPct}%` }} />
              <div className="absolute h-full bg-yellow-400 rounded-full" style={{ width: `${played}%` }} />
            </div>
            {/* Thumb */}
            <div
              className="absolute w-3.5 h-3.5 bg-yellow-400 rounded-full shadow pointer-events-none"
              style={{ left: `calc(${played}% - 7px)` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
          </div>

          {/* Button row */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white p-1.5 touch-manipulation" aria-label={playing ? "Pause" : "Play"}>
              {playing ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Mute */}
            <button onClick={toggleMute} className="text-white p-1.5 touch-manipulation" aria-label={muted ? "Unmute" : "Mute"}>
              {muted || volume === 0 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            {/* Volume slider — hidden on small screens, shown md+ */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="hidden md:block w-20 accent-yellow-400 cursor-pointer"
              aria-label="Volume"
            />

            {/* Time */}
            <span className="text-white text-xs tabular-nums ml-1 flex-1">
              {formatTime(currentTime)}
              <span className="text-white/40"> / {formatTime(duration)}</span>
            </span>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white p-1.5 touch-manipulation ml-1" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="8 3 3 3 3 8" /><line x1="3" y1="3" x2="10" y2="10" />
                  <polyline points="21 8 21 3 16 3" /><line x1="14" y1="10" x2="21" y2="3" />
                  <polyline points="8 21 3 21 3 16" /><line x1="3" y1="21" x2="10" y2="14" />
                  <polyline points="16 21 21 21 21 16" /><line x1="14" y1="14" x2="21" y2="21" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" /><line x1="21" y1="3" x2="14" y2="10" />
                  <polyline points="9 21 3 21 3 15" /><line x1="3" y1="21" x2="10" y2="14" />
                  <polyline points="21 15 21 21 15 21" /><line x1="21" y1="21" x2="14" y2="14" />
                  <polyline points="3 9 3 3 9 3" /><line x1="3" y1="3" x2="10" y2="10" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
