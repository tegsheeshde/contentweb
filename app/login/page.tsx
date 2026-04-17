import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Нэвтрэх — ContentWeb" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Нэвтрэх</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Бүртгэлгүй юу?{" "}
          <a href="/register" className="text-yellow-400 hover:underline">
            Бүртгүүлэх
          </a>
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
