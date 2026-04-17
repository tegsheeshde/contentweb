"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

export default function AdminUploadForm() {
  const router = useRouter();
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"form" | "uploading" | "done">("form");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function uploadPart(url: string, chunk: Blob, partNumber: number, total: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag = xhr.getResponseHeader("ETag") ?? xhr.getResponseHeader("etag") ?? `"part${partNumber}"`;
          resolve(etag);
        } else {
          console.error(`Part ${partNumber} error:`, xhr.status, xhr.responseText);
          reject(new Error(`Part ${partNumber}/${total} failed: ${xhr.status} ${xhr.responseText}`));
        }
      };
      xhr.onerror = () => reject(new Error(`Part ${partNumber} network error`));
      xhr.send(chunk);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const videoFile = videoRef.current?.files?.[0];
    const thumbFile = thumbRef.current?.files?.[0];
    if (!videoFile) { setError("Видео файл сонгоно уу"); return; }

    setStep("uploading");
    setProgress(0);

    try {
      // 1. Multipart upload эхлэх
      setStatusText("Бэлтгэж байна...");
      const startRes = await fetch("/api/upload/multipart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          title: form.get("title"),
          description: form.get("description") || null,
          duration: form.get("duration"),
          isPremium: form.get("isPremium") === "true",
          fileSize: videoFile.size,
          contentType: videoFile.type || "video/mp4",
        }),
      });
      const startData = await startRes.json();
      if (!startRes.ok) throw new Error(startData.error ?? "Алдаа гарлаа");

      const { key, uploadId, partUrls, thumbnailUploadUrl } = startData;
      const totalParts = partUrls.length;
      const parts: { partNumber: number; etag: string }[] = [];

      // 2. Part тус бүр upload
      for (const { partNumber, url } of partUrls) {
        setStatusText(`Part ${partNumber}/${totalParts} upload хийж байна...`);
        const start = (partNumber - 1) * CHUNK_SIZE;
        const chunk = videoFile.slice(start, start + CHUNK_SIZE);
        const etag = await uploadPart(url, chunk, partNumber, totalParts);
        parts.push({ partNumber, etag });
        setProgress(Math.round((partNumber / totalParts) * 90));
      }

      // 3. Multipart дуусгах
      setStatusText("Дуусгаж байна...");
      const completeRes = await fetch("/api/upload/multipart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", key, uploadId, parts }),
      });
      const completeData = await completeRes.json();
      if (!completeRes.ok) throw new Error(completeData.error ?? "Complete алдаа");

      // 4. Thumbnail upload
      if (thumbFile && thumbnailUploadUrl) {
        setStatusText("Thumbnail upload хийж байна...");
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", thumbnailUploadUrl);
          xhr.setRequestHeader("Content-Type", thumbFile.type || "image/jpeg");
          xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`Thumb failed: ${xhr.status}`));
          xhr.onerror = () => reject(new Error("Thumb network error"));
          xhr.send(thumbFile);
        });
      }

      setProgress(100);
      setStatusText("Амжилттай!");
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
        <button onClick={() => { setStep("form"); setProgress(0); }} className="mt-4 text-yellow-400 text-sm hover:underline">Дахин нэмэх</button>
      </div>
    );
  }

  if (step === "uploading") {
    return (
      <div className="py-8">
        <p className="text-zinc-300 text-sm mb-3 text-center">{statusText}</p>
        <div className="w-full bg-zinc-700 rounded-full h-2">
          <div className="bg-yellow-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-zinc-500 text-xs mt-2 text-center">{progress}%</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Гарчиг *</label>
        <input name="title" type="text" required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="Киноны нэр" />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Тайлбар</label>
        <textarea name="description" rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 resize-none" placeholder="Товч тайлбар..." />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Үргэлжлэх хугацаа *</label>
        <input name="duration" type="text" required pattern="\d+:\d{2}:\d{2}" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="1:30:00" />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Төрөл</label>
        <select name="isPremium" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500">
          <option value="true">Premium</option>
          <option value="false">Үнэгүй</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Видео файл * (MP4)</label>
        <input ref={videoRef} type="file" accept="video/mp4,video/*" required className="w-full text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-zinc-700 file:text-white file:text-sm hover:file:bg-zinc-600" />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Thumbnail (JPG)</label>
        <input ref={thumbRef} type="file" accept="image/jpeg,image/png,image/*" className="w-full text-zinc-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-zinc-700 file:text-white file:text-sm hover:file:bg-zinc-600" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors">Upload хийх</button>
    </form>
  );
}
