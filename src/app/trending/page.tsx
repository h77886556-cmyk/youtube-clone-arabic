// صفحة الرائج — الأكثر مشاهدة (إعادة استخدام Home بترتيب trending)
"use client";
import VideoCard from "@/components/VideoCard";
import { useVideos } from "@/hooks/useVideos";

export default function TrendingPage() {
  const { data, isLoading } = useVideos("trending");
  const videos = data?.pages.flatMap((p) => p.videos) ?? [];
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">🔥 الرائج</h1>
      {isLoading && <p>جارٍ التحميل...</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  );
}
