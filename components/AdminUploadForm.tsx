"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminUploadForm() {
  const router = useRouter();
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"form" | "uploading" | "done">("form");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const videoFile = videoRef.current?.files?.[0];
    const thumbFile = thumbRef.current?.files?.[0];

    if (!videoFile) {
      setError("Видео файл сонгоно уу");
      return;
    }

    setStep("uploading");
    setProgress(10);

    try {
      // 1. DB-д бүртгэж presigned URL авах
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description") || null,
          duration: form.get("duration"),
          isPremium: form.get("isPremium") === "true",
          contentType: videoFile.type || "video/mp4",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Алдаа гарлаа");

      setProgress(30);

      // 2. Видео R2-д upload
      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": videoFile.type || "video/mp4" },
        body: videoFile,
      });

      setProgress(80);

      // 3. Thumbnail upload (хэрэв байвал)
      if (thumbFile && data.thumbnailUploadUrl) {
        await fetch(data.thumbnailUploadUrl, {
          method: "PUT",
          headers: { "Content-Type": thumbFile.type || "image/jpeg" },
          body: thumbFile,
        });
      }

      setProgress(100);
      setStep("done");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
      setStep("form");
    }
  }

  if (step === "done") {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">✓</div>
        <p className="text-white font-medium mb-1">Амжилттай нэмэгдлээ!</p>
        <button
          onClick={() => { setStep("form"); setProgress(0); }}
          className="mt-4 text-yellow-400 text-sm hover:underline"
        >
          Дахин нэмэх
        </button>
      </div>
    );
  }

  if (step === "uploading") {
    return (
      <div className="py-8">
        <p className="text-zinc-300 text-sm mb-3 text-center">Upload хийж байна...</p>
        <div className="w-full bg-zinc-700 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-zinc-500 text-xs mt-2 text-center">{progress}%</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Гарчиг *</label>
        <input
          name="title"
          type="text"
          required
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
          placeholder="Киноны нэр"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-1">Тайлбар</label>
        <textarea
          name="description"
          rows={2}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 resize-none"
          placeholder="Товч тайлбар..."
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-1">Үргэлжлэх хугацаа *</label>
        <input
          name="duration"
          type="text"
          required
          pattern="\d+:\d{2}:\d{2}"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
          placeholder="1:30:00"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-1">Төрөл</label>
        <select
          name="isPremium"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
        >
          <option value="true">Premium</option>
          <option value="false">Үнэгүй</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-1">Видео файл * (MP4)</label>
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/*"
          required
          className="w-full text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-zinc-700 file:text-white file:text-sm hover:file:bg-zinc-600"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-1">Thumbnail (JPG)</label>
        <input
          ref={thumbRef}
          type="file"
          accept="image/jpeg,image/png,image/*"
          className="w-full text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-zinc-700 file:text-white file:text-sm hover:file:bg-zinc-600"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
      >
        Upload хийх
      </button>
    </form>
  );
}
