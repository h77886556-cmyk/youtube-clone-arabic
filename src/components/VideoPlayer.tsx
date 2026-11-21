// مشغل HTML5 مخصص — يستأنف من آخر موضع (localStorage + WatchHistory API)
// عدّ المشاهدة مرة واحدة فقط عند بدء التشغيل لأول مرة؛
// حفظ تقدّم الاستئناف يتم عبر استدعاء منفصل لا يزيد العدّاد (countView: false)
"use client";
import { useEffect, useRef } from "react";

export default function VideoPlayer({ videoId, src, poster }: { videoId: string; src: string; poster?: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  const countedRef = useRef(false);
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

  // عدّ المشاهدة مرة واحدة عند أول تشغيل + حفظ الموضع كل 5 ثوانٍ وعند الإيقاف
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const postView = (countView: boolean) => {
      fetch(`/api/videos/${videoId}/view`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: Math.floor(el.currentTime), countView }),
      }).catch(() => null);
    };
    const countOnce = () => {
      if (countedRef.current) return;
      countedRef.current = true;
      postView(true);
    };
    const save = () => {
      localStorage.setItem(key, String(Math.floor(el.currentTime)));
      postView(false);
    };
    const interval = setInterval(save, 5000);
    el.addEventListener("play", countOnce);
    el.addEventListener("pause", save);
    return () => { clearInterval(interval); el.removeEventListener("play", countOnce); el.removeEventListener("pause", save); };
  }, [videoId, key]);

  return (
    <video ref={ref} src={src} poster={poster ?? undefined} controls autoPlay playsInline
      className="aspect-video w-full rounded-xl bg-black" />
  );
}
