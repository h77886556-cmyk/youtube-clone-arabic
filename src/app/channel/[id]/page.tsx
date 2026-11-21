// صفحة القناة — بيانات القناة + زر اشتراك + فيديوهاتها
"use client";
import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import type { VideoItem } from "@/hooks/useVideos";
import { formatViews } from "@/lib/utils";

export default function ChannelPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ channel: { id: string; name: string; handle: string; description?: string | null; avatarUrl?: string | null; videos: VideoItem[]; _count: { subscribers: number; videos: number } }; subscribed: boolean } | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/channels/${params.id}`).then(async (r) => {
      if (!r.ok) { setError("القناة غير موجودة"); return; }
      const d = await r.json(); setData(d); setSubscribed(d.subscribed);
    }).catch(() => setError("القناة غير موجودة"));
  }, [params.id]);

  if (error) return <p>{error}</p>;
  if (!data) return <p>جارٍ التحميل...</p>;
  const { channel } = data;
  const toggle = async () => {
    const res = await fetch("/api/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channelId: channel.id }) });
    if (res.ok) setSubscribed((await res.json()).subscribed);
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">{channel.name[0]}</span>
        <div>
          <h1 className="text-2xl font-bold">{channel.name}</h1>
          <p className="text-gray-500">{channel.handle} • {formatViews(channel._count.subscribers)} مشترك • {channel._count.videos} فيديو</p>
          {channel.description && <p className="mt-1 text-sm">{channel.description}</p>}
        </div>
        <button onClick={toggle} className={`ms-auto rounded-full px-5 py-2 text-sm ${subscribed ? "bg-gray-200 dark:bg-zinc-700" : "bg-black text-white dark:bg-white dark:text-black"}`}>
          {subscribed ? "مشترك" : "اشتراك"}
        </button>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {channel.videos.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
    </div>
  );
}
