import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";

export default async function Navbar() {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;
  const isSubscribed = (session?.user as { subscribed?: boolean })?.subscribed ?? false;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-yellow-500 font-black text-xl tracking-tight">MONGOLIAN</span>
          <span className="text-white font-light text-xl tracking-widest">STREAM</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-zinc-300 hover:text-white text-sm transition-colors">
            Нүүр
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-zinc-300 hover:text-white text-sm transition-colors">
              Admin
            </Link>
          )}

          {session?.user ? (
            <div className="flex items-center gap-3">
              {!isSubscribed && (
                <Link
                  href="/subscribe"
                  className="text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-1.5 rounded-full transition-colors"
                >
                  Захиалах
                </Link>
              )}
              {isSubscribed && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full font-medium">
                  Premium
                </span>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Гарах
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-zinc-300 hover:text-white transition-colors">
                Нэвтрэх
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-white hover:bg-zinc-200 text-black px-4 py-1.5 rounded-full transition-colors"
              >
                Бүртгүүлэх
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
