"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError("Нууц үг таарахгүй байна");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Алдаа гарлаа");
      setLoading(false);
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-zinc-300 mb-1" htmlFor="name">
          Нэр
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="Нэрээ оруулна уу"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-1" htmlFor="email">
          Имэйл
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-1" htmlFor="password">
          Нууц үг
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="Хамгийн багадаа 8 тэмдэгт"
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-300 mb-1" htmlFor="confirm">
          Нууц үг давтах
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
          placeholder="Нууц үгийг дахин оруулна уу"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold rounded-lg transition-colors mt-2"
      >
        {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
      </button>
    </form>
  );
}
