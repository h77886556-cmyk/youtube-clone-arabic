// صفحة الإشعارات
"use client";
import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const [data, setData] = useState<{ notifications: { id: string; message: string; isRead: boolean; createdAt: string; actor?: { name?: string | null } | null }[]; unread: number }>({ notifications: [], unread: 0 });
  useEffect(() => {
    fetch("/api/notifications").then((r) => r.json()).then(setData).catch(() => null);
    fetch("/api/notifications", { method: "PATCH" }).catch(() => null);
  }, []);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">الإشعارات {data.unread > 0 && `(${data.unread} غير مقروءة)`}</h1>
      {data.notifications.length === 0 && <p className="text-gray-500">لا توجد إشعارات.</p>}
      <div className="space-y-2">
        {data.notifications.map((n) => (
          <div key={n.id} className={`rounded-lg border p-3 text-sm dark:border-zinc-800 ${n.isRead ? "" : "bg-blue-50 dark:bg-blue-950/30"}`}>
            {n.message} <span className="text-gray-500">• {timeAgo(n.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
