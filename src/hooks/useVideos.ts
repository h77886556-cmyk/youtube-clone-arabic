// React Query hooks — جلب الفيديوهات والبحث
"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export interface VideoItem {
  id: string; title: string; description?: string | null;
  videoUrl: string; thumbnailUrl?: string | null; duration: number; views: number;
  createdAt: string;
  channel?: { id: string; name: string; handle: string; avatarUrl?: string | null } | null;
  _count?: { likes: number; comments: number };
}

async function fetchVideos(page: number, sort = "latest") {
  const res = await fetch(`/api/videos?page=${page}&sort=${sort}`);
  if (!res.ok) throw new Error("تعذر تحميل الفيديوهات");
  return res.json();
}

export function useVideos(sort = "latest") {
  return useInfiniteQuery({
    queryKey: ["videos", sort],
    queryFn: ({ pageParam = 1 }) => fetchVideos(pageParam, sort),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined,
  });
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("تعذر البحث");
      return res.json();
    },
    enabled: q.trim().length > 0,
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${id}`);
      if (!res.ok) throw new Error("الفيديو غير موجود");
      return res.json();
    },
    enabled: !!id,
  });
}
