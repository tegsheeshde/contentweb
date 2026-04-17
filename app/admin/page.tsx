import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminUploadForm from "@/components/AdminUploadForm";
import DeleteVideoButton from "@/components/DeleteVideoButton";

export const metadata = { title: "Admin — Mongolian Stream" };

export default async function AdminPage() {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;

  if (!session?.user || !isAdmin) redirect("/");

  const videos = await db.video.findMany({
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, duration: true, isPremium: true, publishedAt: true },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-black">Admin панель</h1>
          <p className="text-zinc-500 text-sm mt-1">Кино удирдлага</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload form */}
          <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-5">Шинэ кино нэмэх</h2>
            <AdminUploadForm />
          </div>

          {/* Video list */}
          <div className="bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Кинонууд</h2>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full">{videos.length} нийт</span>
            </div>
            {videos.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                <svg className="mx-auto mb-3 opacity-40" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                <p className="text-sm">Кино байхгүй байна</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {videos.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm line-clamp-1">{v.title}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{v.duration}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {v.isPremium ? (
                        <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-yellow-500/20">
                          PREMIUM
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/20">
                          ҮНЭГҮЙ
                        </span>
                      )}
                      <DeleteVideoButton id={v.id} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
