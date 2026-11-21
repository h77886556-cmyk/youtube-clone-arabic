// استوديو القناة — إحصائيات + إدارة الفيديوهات
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatViews } from "@/lib/utils";

export default function StudioPage() {
  const [data, setData] = useState<{ stats: { views: number; subscribers: number; videos: number; likes: number }; videos: { id: string; title: string; views: number; visibility: string; createdAt: string; _count: { likes: number; comments: number } }[] } | null>(null);

  useEffect(() => {
    fetch("/api/studio/stats").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p>جارٍ التحميل...</p>;
  const { stats, videos } = data;
  const cards = [
    { label: "المشاهدات", value: formatViews(stats.views) },
    { label: "المشتركون", value: formatViews(stats.subscribers) },
    { label: "الفيديوهات", value: String(stats.videos) },
    { label: "الإعجابات", value: formatViews(stats.likes) },
  ];

  const remove = async (id: string) => {
    if (!confirm("حذف هذا الفيديو نهائياً؟")) return;
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    setData({ ...data, videos: videos.filter((v) => v.id !== id) });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">استوديو القناة</h1>
        <Link href="/studio/upload" className="rounded-full bg-red-600 px-4 py-2 text-sm text-white">+ رفع فيديو</Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border p-4 dark:border-zinc-800">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-lg font-bold">فيديوهاتي</h2>
      <div className="mt-3 space-y-2">
        {videos.map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-lg border p-3 dark:border-zinc-800">
            <Link href={`/watch/${v.id}`} className="flex-1 font-semibold hover:underline">{v.title}</Link>
            <span className="text-sm text-gray-500">{formatViews(v.views)} مشاهدة • {v._count.likes} إعجاب • {v._count.comments} تعليق</span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{v.visibility}</span>
            <button onClick={() => remove(v.id)} className="text-sm text-red-600">حذف</button>
          </div>
        ))}
        {videos.length === 0 && <p className="text-gray-500">لم ترفع أي فيديو بعد.</p>}
      </div>
    </div>
  );
}
