// فيديوهات الاستوديو — قائمة فيديوهات المستخدم مع تعديل وحذف
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatViews, timeAgo } from "@/lib/utils";

interface StudioVideo {
  id: string; title: string; description?: string | null;
  views: number; visibility: string; createdAt: string;
  _count: { likes: number; comments: number };
}

export default function StudioVideosPage() {
  const [videos, setVideos] = useState<StudioVideo[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<StudioVideo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] = useState("PUBLIC");

  const load = () => {
    fetch("/api/studio/stats").then(async (r) => {
      if (!r.ok) { setError("سجّل الدخول أولاً"); return; }
      const d = await r.json();
      setVideos(d.videos ?? []);
    }).catch(() => setError("تعذر تحميل الفيديوهات"));
  };
  useEffect(load, []);

  const remove = async (id: string) => {
    if (!confirm("حذف هذا الفيديو نهائياً؟")) return;
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (res.ok) setVideos(videos.filter((v) => v.id !== id));
  };

  const startEdit = (v: StudioVideo) => {
    setEditing(v);
    setEditTitle(v.title);
    setEditDescription(v.description ?? "");
    setEditVisibility(v.visibility);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const res = await fetch(`/api/videos/${editing.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDescription, visibility: editVisibility }),
    });
    if (res.ok) {
      setVideos(videos.map((v) => (v.id === editing.id ? { ...v, title: editTitle, description: editDescription, visibility: editVisibility } : v)));
      setEditing(null);
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">فيديوهاتي</h1>
        <Link href="/studio/upload" className="rounded-full bg-red-600 px-4 py-2 text-sm text-white">+ رفع فيديو</Link>
      </div>
      {videos.length === 0 ? (
        <p className="mt-6 text-gray-500">لم ترفع أي فيديو بعد.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {videos.map((v) => (
            <div key={v.id} className="rounded-lg border p-3 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <Link href={`/watch/${v.id}`} className="flex-1 font-semibold hover:underline">{v.title}</Link>
                <span className="text-sm text-gray-500">{formatViews(v.views)} مشاهدة • {v._count.likes} إعجاب • {v._count.comments} تعليق • {timeAgo(v.createdAt)}</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{v.visibility}</span>
                <button onClick={() => startEdit(v)} className="text-sm text-blue-600">تعديل</button>
                <button onClick={() => remove(v.id)} className="text-sm text-red-600">حذف</button>
              </div>
              {editing?.id === v.id && (
                <div className="mt-3 space-y-2 border-t pt-3 dark:border-zinc-800">
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="العنوان" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="الوصف" rows={2} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
                  <select value={editVisibility} onChange={(e) => setEditVisibility(e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                    <option value="PUBLIC">عام</option>
                    <option value="UNLISTED">غير مدرج</option>
                    <option value="PRIVATE">خاص</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="rounded-full bg-blue-600 px-4 py-1.5 text-sm text-white">حفظ</button>
                    <button onClick={() => setEditing(null)} className="rounded-full border px-4 py-1.5 text-sm dark:border-zinc-700">إلغاء</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
