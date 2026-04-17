import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Бүртгүүлэх — ContentWeb" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Бүртгүүлэх</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Бүртгэлтэй юу?{" "}
          <a href="/login" className="text-yellow-400 hover:underline">
            Нэвтрэх
          </a>
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
