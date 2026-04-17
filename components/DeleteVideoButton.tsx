"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteVideoButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Устгах уу?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Алдаа гарлаа");
      } else {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="shrink-0 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {loading ? "..." : "Устгах"}
    </button>
  );
}
