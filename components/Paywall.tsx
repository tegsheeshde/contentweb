"use client";

import Link from "next/link";

interface PaywallProps {
  movieTitle: string;
}

export default function Paywall({ movieTitle }: PaywallProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-900 rounded-lg p-8 text-center">
      <div className="mb-6">
        <svg
          className="mx-auto mb-4 text-yellow-500"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <h2 className="text-2xl font-bold text-white mb-2">Premium контент</h2>
        <p className="text-zinc-400 max-w-sm">
          <span className="text-white font-medium">{movieTitle}</span> үзэхийн тулд
          эрхийн захиалга авна уу.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/subscribe"
          className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
        >
          Захиалах — QPay
        </Link>
        <Link
          href="/login"
          className="w-full py-3 px-6 border border-zinc-600 hover:border-zinc-400 text-white rounded-lg transition-colors"
        >
          Нэвтрэх
        </Link>
        <Link
          href="/register"
          className="w-full py-2 text-zinc-400 hover:text-white text-sm text-center transition-colors"
        >
          Шинэ бүртгэл үүсгэх
        </Link>
      </div>
    </div>
  );
}
