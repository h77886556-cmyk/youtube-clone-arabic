// نموذج الرفع — ملف فيديو + صورة مصغرة + شريط تقدم (رفع مباشر إلى Cloudinary)
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("اختر ملف فيديو أولاً"); return; }
    setBusy(true); setError("");
    try {
      // 1) رفع إلى Cloudinary عبر unsigned preset (يُضبط في لوحة Cloudinary)
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "youtube-clone");
      fd.append("resource_type", "video");
      const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const up = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/video/upload`, { method: "POST", body: fd });
      const data = await up.json();
      if (!up.ok) throw new Error(data.error?.message ?? "فشل الرفع");
      setProgress(90);
      // 2) حفظ البيانات الوصفية في قاعدة البيانات
      const res = await fetch("/api/videos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, visibility, videoUrl: data.secure_url,
          thumbnailUrl: data.secure_url.replace("/upload/", "/upload/so_5,w_1280,h_720,c_fill/").replace(/\.[^.]+$/, ".jpg"),
          duration: Math.round(data.duration ?? 0), tags: [],
        }),
      });
      if (!res.ok) throw new Error("فشل حفظ الفيديو");
      const { video } = await res.json();
      router.push(`/watch/${video.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-xl border p-6 dark:border-zinc-800">
      <h1 className="text-xl font-bold">رفع فيديو جديد</h1>
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
      {file && <p className="text-sm text-gray-500">{file.name} — {(file.size / 1e6).toFixed(1)} MB</p>}
      {progress > 0 && <progress value={progress} max={100} className="w-full" />}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="العنوان" required className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="الوصف" rows={4} className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
      <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
        <option value="PUBLIC">عام</option>
        <option value="UNLISTED">غير مدرج</option>
        <option value="PRIVATE">خاص</option>
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white disabled:opacity-50">
        {busy ? "جارٍ الرفع..." : "رفع ونشر"}
      </button>
    </form>
  );
}
