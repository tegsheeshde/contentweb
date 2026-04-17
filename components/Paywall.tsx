"use client";

import Link from "next/link";

interface PaywallProps {
  movieTitle: string;
}

export default function Paywall({ movieTitle }: PaywallProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Premium контент</h2>
      <p className="text-zinc-400 max-w-sm mb-8 text-sm leading-relaxed">
        <span className="text-white font-semibold">{movieTitle}</span>-г үзэхийн тулд
        Premium захиалга авна уу.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/subscribe"
          className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95 text-sm"
        >
          Захиалах — 9,900₮/сар
        </Link>
        <Link
          href="/login"
          className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full transition-colors text-sm"
        >
          Нэвтрэх
        </Link>
        <Link
          href="/register"
          className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-xs text-center transition-colors"
        >
          Шинэ бүртгэл үүсгэх →
        </Link>
      </div>
    </div>
  );
}
