// زر تبديل الوضع الفاتح/الداكن
"use client";
import { Moon, Sun } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useStore();
  return (
    <button onClick={toggleTheme} aria-label="تبديل المظهر" className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
