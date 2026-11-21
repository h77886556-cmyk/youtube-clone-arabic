// صفحة البحث — نتائج من /api/search
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import VideoCard from "@/components/VideoCard";
import { useSearch } from "@/hooks/useVideos";

function Results() {
  const q = useSearchParams().get("q") ?? "";
  const { data, isLoading } = useSearch(q);
  const videos = data?.videos ?? [];
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">نتائج البحث عن: {q}</h1>
      {isLoading && <p>جارٍ البحث...</p>}
      {!isLoading && videos.length === 0 && <p className="text-gray-500">لا توجد نتائج مطابقة.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((v: never) => <VideoCard key={(v as { id: string }).id} video={v as never} />)}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<p>جارٍ التحميل...</p>}><Results /></Suspense>;
}
