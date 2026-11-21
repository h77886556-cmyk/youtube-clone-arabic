// مشغل HTML5 مخصص — يستأنف من آخر موضع (localStorage + WatchHistory API)
"use client";
import { useEffect, useRef } from "react";

export default function VideoPlayer({ videoId, src, poster }: { videoId: string; src: string; poster?: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  const key = `progress:${videoId}`;

  // استئناف من آخر موضع محفوظ محلياً
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const saved = Number(localStorage.getItem(key) ?? 0);
    const onMeta = () => { if (saved > 0 && saved < el.duration - 10) el.currentTime = saved; };
    el.addEventListener("loadedmetadata", onMeta);
    return () => el.removeEventListener("loadedmetadata", onMeta);
  }, [key]);

  // حفظ الموضع كل 5 ثوانٍ + عند الإيقاف، وإرساله للخادم
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const save = () => {
      localStorage.setItem(key, String(Math.floor(el.currentTime)));
      fetch(`/api/videos/${videoId}/view`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: Math.floor(el.currentTime) }),
      }).catch(() => null);
    };
    const interval = setInterval(save, 5000);
    el.addEventListener("pause", save);
    return () => { clearInterval(interval); el.removeEventListener("pause", save); };
  }, [videoId, key]);

  return (
    <video ref={ref} src={src} poster={poster ?? undefined} controls autoPlay playsInline
      className="aspect-video w-full rounded-xl bg-black" />
  );
}
