import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminUploadForm from "@/components/AdminUploadForm";
import DeleteVideoButton from "@/components/DeleteVideoButton";

export const metadata = { title: "Admin — ContentWeb" };

export default async function AdminPage() {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin ?? false;

  if (!session?.user || !isAdmin) redirect("/");

  const videos = await db.video.findMany({
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, duration: true, isPremium: true, publishedAt: true },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8">Admin — Кино удирдлага</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload form */}
          <div className="bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Шинэ кино нэмэх</h2>
            <AdminUploadForm />
          </div>

          {/* Video list */}
          <div className="bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              Кинонууд ({videos.length})
            </h2>
            {videos.length === 0 ? (
              <p className="text-zinc-500 text-sm">Кино байхгүй байна.</p>
            ) : (
              <ul className="space-y-3">
                {videos.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="text-white font-medium line-clamp-1">{v.title}</p>
                      <p className="text-zinc-500 text-xs">{v.duration}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {v.isPremium && (
                        <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                          PREMIUM
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
