"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface QPayInvoice {
  invoice_id: string;
  qr_image: string;
  urls: { name: string; description: string; logo: string; link: string }[];
}

const features = [
  "HD чанартай видео",
  "Шинэ кино бүр нэмэгдэнэ",
  "Хэдэн ч төхөөрөмж дээр",
  "Зар сурталчилгаагүй",
];

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<QPayInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!invoice) return;
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/payment/qpay?invoice_id=${invoice.invoice_id}`);
      const data = await res.json();
      if (data.status === "PAID") {
        clearInterval(pollRef.current!);
        setPaid(true);
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Амжилттай!</h2>
          <p className="text-zinc-400">Нүүр хуудас руу шилжиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        {!invoice ? (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-6">
                <span className="text-yellow-400 text-xs font-semibold tracking-wider uppercase">Premium</span>
              </div>
              <h1 className="text-4xl font-black text-white mb-3">
                Хязгааргүй үзэх
              </h1>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-black text-white">9,900</span>
                <span className="text-xl text-zinc-400 font-medium">₮/сар</span>
              </div>
              <p className="text-zinc-500 text-sm">Хүссэн үедээ цуцлах боломжтой</p>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-6 mb-6">
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={createInvoice}
              disabled={loading}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-black rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
            >
              {loading ? "Үүсгэж байна..." : "QPay-р захиалах"}
            </button>
          </>
        ) : (
          <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-8 flex flex-col items-center gap-5">
            <div>
              <h2 className="text-xl font-black text-white text-center mb-1">QPay төлбөр</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <p className="text-zinc-400 text-sm">QR кодыг уншуулж төлнө үү</p>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-2xl">
              <Image
                src={`data:image/png;base64,${invoice.qr_image}`}
                alt="QPay QR"
                width={200}
                height={200}
                unoptimized
              />
            </div>
            {invoice.urls?.length > 0 && (
              <div className="w-full grid grid-cols-3 gap-2">
                {invoice.urls.map((u) => (
                  <a
                    key={u.name}
                    href={u.link}
                    className="flex flex-col items-center gap-1.5 p-3 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl transition-colors"
                  >
                    <Image src={u.logo} alt={u.name} width={32} height={32} className="rounded-lg" unoptimized />
                    <span className="text-zinc-400 text-xs">{u.name}</span>
                  </a>
                ))}
              </div>
            )}
            <p className="text-zinc-600 text-xs">Төлбөр хүлээж байна...</p>
          </div>
        )}

        {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
