// الملف الشخصي — بيانات المستخدم الحالي وقناته وفيديوهاته
"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import type { VideoItem } from "@/hooks/useVideos";
import { formatViews } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [channel, setChannel] = useState<{ id: string; name: string; handle: string; description?: string | null; _count: { subscribers: number } } | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    if (newPassword !== confirmPassword) { setPwMsg("كلمة المرور الجديدة وتأكيدها غير متطابقين"); return; }
    if (newPassword.length < 8) { setPwMsg("كلمة المرور الجديدة 8 أحرف على الأقل"); return; }
    setPwBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "تعذر تغيير كلمة المرور");
      setPwMsg("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally { setPwBusy(false); }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/studio/stats").then(async (r) => {
      if (!r.ok) { setError("تعذر تحميل بيانات القناة"); return; }
      const d = await r.json();
      setVideos(d.videos ?? []);
    }).catch(() => setError("تعذر تحميل بيانات القناة"));
  }, [status]);

  // قناة المستخدم: تُستنتج من أول فيديو ثم تُجلب بياناتها من /api/channels
  const channelId = videos[0] ? (videos[0] as { channelId?: string }).channelId : undefined;
  useEffect(() => {
    if (!channelId) return;
    fetch(`/api/channels/${channelId}`).then(async (r) => {
      if (!r.ok) return;
      const d = await r.json();
      setChannel(d.channel);
    }).catch(() => null);
  }, [channelId]);

  if (status === "loading") return <p>جارٍ التحميل...</p>;
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div>
        <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        <p className="mt-4 text-gray-500">سجّل الدخول أولاً لعرض ملفك الشخصي.</p>
        <Link href="/auth/signin" className="mt-4 inline-block rounded-full bg-red-600 px-4 py-2 text-sm text-white">تسجيل الدخول</Link>
      </div>
    );
  }

  const user = session.user;
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">{user.name?.[0] ?? "؟"}</span>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          {channel && <p className="text-sm text-gray-500">{channel.name} • {channel.handle} • {formatViews(channel._count.subscribers)} مشترك</p>}
        </div>
        <Link href="/studio" className="ms-auto rounded-full border px-4 py-2 text-sm dark:border-zinc-700">تعديل في الاستوديو</Link>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <form onSubmit={changePassword} className="mt-8 max-w-md space-y-3 rounded-xl border p-5 dark:border-zinc-800">
        <h2 className="text-lg font-bold">تغيير كلمة المرور</h2>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="كلمة المرور الحالية" required className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)" required className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور الجديدة" required className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        {pwMsg && <p className={`text-sm ${pwMsg.startsWith("تم") ? "text-green-600" : "text-red-600"}`}>{pwMsg}</p>}
        <button disabled={pwBusy} className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {pwBusy ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
        </button>
      </form>
      <h2 className="mt-8 text-lg font-bold">فيديوهاتي ({videos.length})</h2>
      {videos.length === 0 ? (
        <p className="mt-3 text-gray-500">لم ترفع أي فيديو بعد.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  );
}
