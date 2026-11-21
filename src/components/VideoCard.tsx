// بطاقة فيديو — صورة مصغرة + عنوان + قناة + مشاهدات
import Image from "next/image";
import Link from "next/link";
import { formatDuration, formatViews, timeAgo } from "@/lib/utils";
import type { VideoItem } from "@/hooks/useVideos";

export default function VideoCard({ video }: { video: VideoItem }) {
  return (
    <Link href={`/watch/${video.id}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-200 dark:bg-zinc-800">
        {video.thumbnailUrl ? (
          <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🎬</div>
        )}
        <span className="absolute bottom-2 end-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
          {formatDuration(video.duration)}
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        {video.channel?.avatarUrl ? (
          <Image src={video.channel.avatarUrl} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40">
            {video.channel?.name?.[0] ?? "؟"}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold leading-snug">{video.title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">{video.channel?.name}</p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {formatViews(video.views)} مشاهدة • {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
