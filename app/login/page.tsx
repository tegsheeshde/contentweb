import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Нэвтрэх — Mongolian Stream" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Нэвтрэх</h1>
          <p className="text-zinc-400 text-sm">
            Бүртгэлгүй юу?{" "}
            <a href="/register" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
              Бүртгүүлэх
            </a>
          </p>
        </div>
        <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
