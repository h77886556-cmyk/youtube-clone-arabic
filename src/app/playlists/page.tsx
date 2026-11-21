// قوائم التشغيل — إنشاء قائمة + عرض قوائم المستخدم
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<{ id: string; title: string; items: { video: { id: string; title: string } }[] }[]>([]);
  const [title, setTitle] = useState("");
  useEffect(() => {
    fetch("/api/playlists").then((r) => r.json()).then((d) => setPlaylists(d.playlists ?? [])).catch(() => null);
  }, []);
  const create = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/playlists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
    if (res.ok) { const { playlist } = await res.json(); setPlaylists([{ ...playlist, items: [] }, ...playlists]); setTitle(""); }
  };
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">قوائم التشغيل</h1>
      <div className="mb-6 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اسم قائمة جديدة" className="flex-1 rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        <button onClick={create} className="rounded-lg bg-red-600 px-4 py-2 text-white">إنشاء</button>
      </div>
      <div className="space-y-3">
        {playlists.map((p) => (
          <div key={p.id} className="rounded-xl border p-4 dark:border-zinc-800">
            <Link href={`/playlist/${p.id}`} className="font-bold hover:underline">{p.title}</Link> <span className="text-sm text-gray-500">({p.items?.length ?? 0} فيديو)</span>
            <div className="mt-2 space-y-1">
              {p.items?.map((i) => <Link key={i.video.id} href={`/watch/${i.video.id}`} className="block text-sm text-blue-600 hover:underline">{i.video.title}</Link>)}
            </div>
          </div>
        ))}
        {playlists.length === 0 && <p className="text-gray-500">لا توجد قوائم بعد.</p>}
      </div>
    </div>
  );
}
