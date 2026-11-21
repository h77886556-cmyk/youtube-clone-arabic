// Sidebar قابل للطي — روابط التنقل الرئيسية
"use client";
import { Clock, Flame, Home, ListVideo, ThumbsUp, Users, LayoutDashboard, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/subscriptions", label: "الاشتراكات", icon: Users },
  { href: "/history", label: "السجل", icon: Clock },
  { href: "/liked", label: "الفيديوهات المعجبة", icon: ThumbsUp },
  { href: "/playlists", label: "قوائم التشغيل", icon: ListVideo },
  { href: "/trending", label: "الرائج", icon: Flame },
  { href: "/studio", label: "استوديو القناة", icon: LayoutDashboard },
  { href: "/studio/upload", label: "رفع فيديو", icon: Upload },
];

export default function Sidebar() {
  const open = useStore((s) => s.sidebarOpen);
  const pathname = usePathname();
  if (!open) return null;
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto p-3 md:block">
      <nav className="space-y-1">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10",
              pathname === href && "bg-black/5 font-semibold dark:bg-white/10")}>
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
