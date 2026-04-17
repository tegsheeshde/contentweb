"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface QPayInvoice {
  invoice_id: string;
  qr_image: string;
  urls: { name: string; description: string; logo: string; link: string }[];
}

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<QPayInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Төлбөр шалгах polling
  useEffect(() => {
    if (!invoice) return;

    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/payment/qpay?invoice_id=${invoice.invoice_id}`);
      const data = await res.json();
      if (data.status === "PAID") {
        clearInterval(pollRef.current!);
        setPaid(true);
        // Session шинэчлэх → нүүр хуудас руу
        setTimeout(() => router.push("/"), 2000);
      }
    }, 3000);

    return () => clearInterval(pollRef.current!);
  }, [invoice, router]);

  const createInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/qpay", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Нэхэмжлэл үүсгэхэд алдаа гарлаа");
      setInvoice(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-white mb-2">Төлбөр амжилттай!</h2>
          <p className="text-zinc-400">Нүүр хуудас руу шилжиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Захиалга</h1>
        <p className="text-zinc-400 mb-6">Сарын 9,900₮ — хязгааргүй контент үзэх эрх</p>

        <ul className="mb-8 space-y-2">
          {["HD чанартай видео", "Шинэ кино бүр нэмэгдэнэ", "Хэдэн ч төхөөрөмж дээр"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-zinc-300 text-sm">
              <span className="text-yellow-500">✓</span> {f}
            </li>
          ))}
        </ul>

        {!invoice ? (
          <button
            onClick={createInvoice}
            disabled={loading}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold rounded-lg transition-colors"
          >
            {loading ? "Үүсгэж байна..." : "QPay-р төлөх"}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <p className="text-zinc-300 text-sm">QR кодыг уншуулж төлнө үү</p>
            </div>
            <Image
              src={`data:image/png;base64,${invoice.qr_image}`}
              alt="QPay QR"
              width={200}
              height={200}
              className="rounded-lg"
              unoptimized
            />
            {invoice.urls?.length > 0 && (
              <div className="w-full grid grid-cols-3 gap-2">
                {invoice.urls.map((u) => (
                  <a
                    key={u.name}
                    href={u.link}
                    className="flex flex-col items-center gap-1 p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    <Image src={u.logo} alt={u.name} width={32} height={32} className="rounded" unoptimized />
                    <span className="text-zinc-300 text-xs">{u.name}</span>
                  </a>
                ))}
              </div>
            )}
            <p className="text-zinc-500 text-xs">Төлбөр хүлээж байна...</p>
          </div>
        )}

        {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
