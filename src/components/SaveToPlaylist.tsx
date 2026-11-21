// زر "حفظ" في صفحة المشاهدة — إضافة الفيديو إلى قائمة تشغيل أو إزالته منها،
// مع إنشاء قائمة جديدة من نفس القائمة المنسدلة (دون مغادرة الصفحة).
"use client";
import { BookmarkPlus, Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PlaylistItem {
  video: { id: string };
}
interface Playlist {
  id: string;
  title: string;
  isLiked?: boolean;
  isWatchLater?: boolean;
  items: PlaylistItem[];
}

export default function SaveToPlaylist({ videoId }: { videoId: string }) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // جلب قوائم المستخدم عند فتح القائمة فقط (قائمة "المعجبة" مستثناة: لها زر الإعجاب)
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((d) => setPlaylists((d.playlists ?? []).filter((p: Playlist) => !p.isLiked)))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [open ]);

  const inPlaylist = (p: Playlist) => p.items.some((i) => i.video.id === videoId);

  const toggle = async (p: Playlist) => {
    const added = !inPlaylist(p);
    // تحديث متفائل في الواجهة
    setPlaylists((list) =>
      list.map((x) =>
        x.id === p.id
          ? { ...x, items: added ? [...x.items, { video: { id: videoId } }] : x.items.filter((i) => i.video.id !== videoId) }
          : x
      )
    );
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId: p.id, videoId, action: added ? "add" : "remove" }),
    });
    if (!res.ok) {
      // التراجع عن التحديث المتفائل عند الفشل
      setPlaylists((list) =>
        list.map((x) =>
          x.id === p.id
            ? { ...x, items: added ? x.items.filter((i) => i.video.id !== videoId) : [...x.items, { video: { id: videoId } }] }
            : x
        )
      );
    }
  };

  const createPlaylist = async () => {
    const title = newTitle.trim();
    if (!title || creating) return;
    setCreating(true);
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const { playlist } = await res.json();
      // إضافة الفيديو للقائمة الجديدة فور إنشائها
      await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId: playlist.id, videoId, action: "add" }),
      });
      setPlaylists((list) => [{ ...playlist, items: [{ video: { id: videoId } }] }, ...list]);
      setNewTitle("");
    }
    setCreating(false);
  };

  const savedCount = playlists.filter(inPlaylist).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-2 text-sm dark:bg-zinc-800"
      >
        <BookmarkPlus className="h-4 w-4" />
        {savedCount > 0 ? `محفوظ في ${savedCount}` : "حفظ"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <b className="text-sm">حفظ في قائمة تشغيل</b>
              <button onClick={() => setOpen(false)} title="إغلاق"><X className="h-4 w-4" /></button>
            </div>
            {loading && <p className="text-sm text-gray-500">جارٍ التحميل...</p>}
            {!loading && playlists.length === 0 && (
              <p className="text-sm text-gray-500">لا توجد قوائم بعد — أنشئ أول قائمة بالأسفل.</p>
            )}
            <ul className="max-h-56 space-y-1 overflow-y-auto">
              {playlists.map((p) => (
                <li key={p.id}>
                  <button onClick={() => toggle(p)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-zinc-800">
                    <span className={`flex h-5 w-5 items-center justify-center rounded border ${inPlaylist(p) ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"}`}>
                      {inPlaylist(p) && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex-1 truncate">{p.title}</span>
                    {p.isWatchLater && <span className="text-xs text-gray-500">المشاهدة لاحقاً</span>}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2 border-t pt-3 dark:border-zinc-700">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
                placeholder="اسم قائمة جديدة..."
                className="min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
              <button onClick={createPlaylist} disabled={creating || !newTitle.trim()} className="flex items-center gap-1 rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black">
                <Plus className="h-4 w-4" /> إنشاء
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
