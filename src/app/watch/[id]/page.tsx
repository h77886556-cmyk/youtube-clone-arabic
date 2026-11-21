// صفحة المشاهدة — مشغل + معلومات + إعجاب + اشتراك + تعليقات + مقترحات
"use client";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Comments from "@/components/Comments";
import SaveToPlaylist from "@/components/SaveToPlaylist";
import VideoCard from "@/components/VideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import { useVideo, useVideos } from "@/hooks/useVideos";
import { formatViews, timeAgo } from "@/lib/utils";

export default function WatchPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useVideo(params.id);
  const { data: suggested } = useVideos("trending");
  const { data: session } = useSession();
  const [liked, setLiked] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const video = data?.video;

  // تسجيل مشاهدة عند الفتح (مرة واحدة)
  useEffect(() => {
    fetch(`/api/videos/${params.id}/view`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ progress: 0 }) }).catch(() => null);
  }, [params.id]);

  if (isLoading) return <p>جارٍ التحميل...</p>;
  if (!video) return <p>الفيديو غير موجود.</p>;

  const like = async (type: "LIKE" | "DISLIKE") => {
    const res = await fetch(`/api/videos/${video.id}/like`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }) });
    if (res.ok) setLiked((await res.json()).liked);
  };
  const toggleSub = async () => {
    const res = await fetch("/api/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channelId: video.channelId }) });
    if (res.ok) setSubscribed((await res.json()).subscribed);
  };

  const suggestions = (suggested?.pages.flatMap((p) => p.videos) ?? []).filter((v) => v.id !== video.id).slice(0, 8);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <VideoPlayer videoId={video.id} src={video.videoUrl} poster={video.thumbnailUrl} />
        <h1 className="mt-4 text-xl font-bold">{video.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Link href={`/channel/${video.channel?.id}`} className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">{video.channel?.name?.[0]}</span>
            <span><b className="block">{video.channel?.name}</b><span className="text-sm text-gray-500">{video.channel?._count?.subscribers ?? 0} مشترك</span></span>
          </Link>
          {session && (
            <button onClick={toggleSub} className={`rounded-full px-4 py-2 text-sm ${subscribed ? "bg-gray-200 dark:bg-zinc-700" : "bg-black text-white dark:bg-white dark:text-black"}`}>
              {subscribed ? "مشترك" : "اشتراك"}
            </button>
          )}
          <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-zinc-800">
            <button onClick={() => like("LIKE")} className={`flex items-center gap-1 px-2 ${liked === "LIKE" ? "text-blue-600" : ""}`}><ThumbsUp className="h-4 w-4" /> {video._count?.likes ?? 0}</button>
            <button onClick={() => like("DISLIKE")} className={liked === "DISLIKE" ? "text-blue-600" : ""}><ThumbsDown className="h-4 w-4" /></button>
          </div>
          {session && <SaveToPlaylist videoId={video.id} />}
          <span className="text-sm text-gray-500">{formatViews(video.views)} مشاهدة • {timeAgo(video.createdAt)}</span>
        </div>
        {video.description && <p className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-100 p-4 text-sm dark:bg-zinc-800">{video.description}</p>}
        <Comments videoId={video.id} />
      </div>
      <aside className="space-y-4">
        <h2 className="font-bold">فيديوهات مقترحة</h2>
        {suggestions.map((v) => <VideoCard key={v.id} video={v} />)}
      </aside>
    </div>
  );
}
