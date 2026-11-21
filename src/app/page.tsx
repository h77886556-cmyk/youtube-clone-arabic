// الصفحة الرئيسية — خلاصة الفيديوهات مع فلترة وترقيم لانهائي
"use client";
import { useState } from "react";
import VideoCard from "@/components/VideoCard";
import { useVideos } from "@/hooks/useVideos";

const SORTS = [
  { value: "latest", label: "الأحدث" },
  { value: "views", label: "الأكثر مشاهدة" },
  { value: "trending", label: "الرائج" },
] as const;

export default function HomePage() {
  const [sort, setSort] = useState<"latest" | "views" | "trending">("latest");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useVideos(sort);
  const videos = data?.pages.flatMap((p) => p.videos) ?? [];

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {SORTS.map((s) => (
          <button key={s.value} onClick={() => setSort(s.value)}
            className={`rounded-full px-4 py-1.5 text-sm ${sort === s.value ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-100 dark:bg-zinc-800"}`}>
            {s.label}
          </button>
        ))}
      </div>
      {isLoading && <p>جارٍ التحميل...</p>}
      {error && <p className="text-red-600">تعذر تحميل الفيديوهات، حاول لاحقاً.</p>}
      {!isLoading && videos.length === 0 && <p className="text-gray-500">لا توجد فيديوهات بعد — كن أول من يرفع!</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
          className="mx-auto mt-8 block rounded-full border px-6 py-2 text-sm dark:border-zinc-700">
          {isFetchingNextPage ? "جارٍ التحميل..." : "عرض المزيد"}
        </button>
      )}
    </div>
  );
}
