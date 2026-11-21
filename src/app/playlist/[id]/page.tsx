// صفحة قائمة تشغيل واحدة — /playlist/[id]
// تعرض فيديوهات القائمة بالترتيب، مع تشغيل الكل، وحذف فيديو من القائمة،
// وحذف القائمة نفسها (للمالك فقط).
"use client";
import { Play, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import type { VideoItem } from "@/hooks/useVideos";

interface PlaylistItem {
  id: string;
  video: VideoItem;
}

interface Playlist {
  id: string;
  title: string;
  description?: string | null;
  isLiked?: boolean;
  isWatchLater?: boolean;
  userId: string;
  user?: { id: string; name?: string | null } | null;
  items: PlaylistItem[];
}

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/playlists/${params.id}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return; }
        const d = await r.json();
        setPlaylist(d.playlist);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const removeVideo = async (videoId: string) => {
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId: params.id, videoId, action: "remove" }),
    });
    if (res.ok) {
      setPlaylist((p: Playlist | null) => p && { ...p, items: p.items.filter((i: PlaylistItem) => i.video.id !== videoId) });
    }
  };

  const deletePlaylist = async () => {
    if (!confirm("حذف هذه القائمة نهائياً؟")) return;
    const res = await fetch(`/api/playlists/${params.id}`, { method: "DELETE" });
    if (res.ok) router.push("/playlists");
  };

  if (loading) return <p>جارٍ التحميل...</p>;
  if (notFound || !playlist) return <p>القائمة غير موجودة أو خاصة.</p>;

  const videos = playlist.items.map((i) => i.video);
  const first = videos[0];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{playlist.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {playlist.user?.name ?? ""} • {videos.length} فيديو
            {playlist.isLiked ? " • الفيديوهات المعجبة" : ""}
            {playlist.isWatchLater ? " • المشاهدة لاحقاً" : ""}
          </p>
          {playlist.description && <p className="mt-2 whitespace-pre-wrap text-sm">{playlist.description}</p>}
        </div>
        <div className="flex gap-2">
          {first && (
            <Link href={`/watch/${first.id}`} className="flex items-center gap-1 rounded-full bg-red-600 px-4 py-2 text-sm text-white">
              <Play className="h-4 w-4" /> تشغيل الكل
            </Link>
          )}
          <button onClick={deletePlaylist} className="flex items-center gap-1 rounded-full bg-gray-200 px-4 py-2 text-sm dark:bg-zinc-700">
            <Trash2 className="h-4 w-4" /> حذف القائمة
          </button>
        </div>
      </div>
      {videos.length === 0 && <p className="text-gray-500">لا توجد فيديوهات في هذه القائمة بعد.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {playlist.items.map((item: PlaylistItem) => (
          <div key={item.id} className="relative">
            <VideoCard video={item.video} />
            <button
              onClick={() => removeVideo(item.video.id)}
              title="إزالة من القائمة"
              className="absolute left-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
