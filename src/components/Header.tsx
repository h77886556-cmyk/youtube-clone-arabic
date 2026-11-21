// Header: شعار + بحث + رفع + إشعارات + صورة المستخدم
"use client";
import { Bell, Menu, Plus, Youtube } from "lucide-react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useStore } from "@/store/useStore";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { data: session } = useSession();
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  return (
    <header className="sticky top-0 z-50 flex items-center gap-4 bg-white/95 px-4 py-2 backdrop-blur dark:bg-zinc-950/95">
      <button onClick={toggleSidebar} aria-label="القائمة" className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10">
        <Menu className="h-5 w-5" />
      </button>
      <Link href="/" className="flex items-center gap-1 text-xl font-bold">
        <Youtube className="h-7 w-7 text-red-600" />
        <span>عربي<span className="text-red-600">تيوب</span></span>
      </Link>
      <div className="hidden flex-1 justify-center md:flex"><SearchBar /></div>
      <div className="ms-auto flex items-center gap-2">
        <ThemeToggle />
        {session ? (
          <>
            <Link href="/studio/upload" className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-2 text-sm dark:bg-zinc-800">
              <Plus className="h-4 w-4" /> رفع
            </Link>
            <Link href="/notifications" aria-label="الإشعارات" className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={session.user?.image ?? "/avatar.png"} alt="المستخدم" className="h-8 w-8 rounded-full object-cover" onClick={() => signOut()} title="تسجيل الخروج" />
          </>
        ) : (
          <button onClick={() => signIn()} className="rounded-full border border-blue-600 px-4 py-1.5 text-sm text-blue-600">تسجيل الدخول</button>
        )}
      </div>
    </header>
  );
}
