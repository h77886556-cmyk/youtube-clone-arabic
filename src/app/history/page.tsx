// سجل المشاهدة — مع زر مسح السجل
"use client";
import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import type { VideoItem } from "@/hooks/useVideos";

export default function HistoryPage() {
  const [history, setHistory] = useState<{ id: string; video: VideoItem; progress: number }[]>([]);
  useEffect(() => {
    fetch("/api/history").then((r) => r.json()).then((d) => setHistory(d.history ?? []));
  }, []);
  const clear = async () => {
    if (!confirm("مسح سجل المشاهدة كاملاً؟")) return;
    await fetch("/api/history", { method: "DELETE" });
    setHistory([]);
  };
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">سجل المشاهدة</h1>
        <button onClick={clear} className="rounded-full border px-4 py-1.5 text-sm dark:border-zinc-700">مسح السجل</button>
      </div>
      {history.length === 0 && <p className="text-gray-500">لا يوجد سجل بعد.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {history.map((h) => <VideoCard key={h.id} video={h.video} />)}
      </div>
    </div>
  );
}
