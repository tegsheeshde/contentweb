"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminUploadForm() {
  const router = useRouter();
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"form" | "uploading" | "done">("form");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const videoFile = videoRef.current?.files?.[0];
    if (!videoFile) {
      setError("Видео файл сонгоно уу");
      return;
    }

    const form = new FormData(e.currentTarget);
    form.set("video", videoFile);
    if (thumbRef.current?.files?.[0]) {
      form.set("thumbnail", thumbRef.current.files[0]);
    }

    setStep("uploading");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Алдаа гарлаа");

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
          onClick={() => setStep("form")}
          className="mt-4 text-yellow-400 text-sm hover:underline"
        >
          Дахин нэмэх
        </button>
      </div>
    );
  }

  if (step === "uploading") {
    return (
      <div className="py-8 text-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-zinc-300 text-sm">Upload хийж байна... түр хүлээнэ үү</p>
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
