import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Бүртгүүлэх — Mongolian Stream" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Бүртгүүлэх</h1>
          <p className="text-zinc-400 text-sm">
            Бүртгэлтэй юу?{" "}
            <a href="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
              Нэвтрэх
            </a>
          </p>
        </div>
        <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
