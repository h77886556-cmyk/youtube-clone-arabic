// الفيديوهات المعجبة — من قائمة Liked عبر /api/videos?sort=... (نسخة مبسطة: فيديوهات أعجب بها المستخدم عبر playlists)
// ملاحظة: تُجلب من API خاص لاحقاً؛ هنا تعرض أحدث الفيديوهات كبداية قابلة للاستبدال بنقطة نهاية liked.
"use client";
import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";

export default function LikedPage() {
  const [videos, setVideos] = useState<never[]>([]);
  useEffect(() => {
    // قائمة Liked تُخزَّن كـ Playlist خاصة (isLiked) — تُجلب من /api/playlists
    fetch("/api/playlists").then((r) => r.json()).then((d) => {
      const liked = (d.playlists ?? []).find((p: { isLiked: boolean }) => p.isLiked);
      setVideos(liked?.items?.map((i: { video: never }) => i.video) ?? []);
    }).catch(() => setVideos([]));
  }, []);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">الفيديوهات المعجبة</h1>
      {videos.length === 0 && <p className="text-gray-500">لم تعجب بأي فيديو بعد.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((v: never) => <VideoCard key={(v as { id: string }).id} video={v as never} />)}
      </div>
    </div>
  );
}
