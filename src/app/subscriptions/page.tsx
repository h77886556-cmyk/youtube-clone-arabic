// صفحة الاشتراكات — قنوات المشترك بها + أحدث فيديوهاتها
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<{ id: string; channel: { id: string; name: string; handle: string; avatarUrl?: string | null; _count: { subscribers: number } } }[]>([]);
  const [videos, setVideos] = useState<never[]>([]);
  useEffect(() => {
    fetch("/api/subscriptions").then((r) => r.json()).then(async (d) => {
      const list = d.subscriptions ?? [];
      setSubs(list);
      // أحدث فيديوهات القنوات المشترك بها
      const all: never[] = [];
      for (const s of list.slice(0, 5)) {
        const ch = await fetch(`/api/channels/${s.channel.id}`).then((r) => r.json()).catch(() => null);
        if (ch?.channel?.videos) all.push(...ch.channel.videos);
      }
      setVideos(all.slice(0, 12));
    }).catch(() => null);
  }, []);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">الاشتراكات</h1>
      <div className="mb-8 flex flex-wrap gap-3">
        {subs.map((s) => (
          <Link key={s.id} href={`/channel/${s.channel.id}`} className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm dark:border-zinc-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">{s.channel.name[0]}</span>
            {s.channel.name}
          </Link>
        ))}
        {subs.length === 0 && <p className="text-gray-500">لم تشترك في أي قناة بعد.</p>}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((v: never) => <VideoCard key={(v as { id: string }).id} video={v as never} />)}
      </div>
    </div>
  );
}
