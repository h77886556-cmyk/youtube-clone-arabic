// مزود الثيم — يبدّل class "dark" على <html>
"use client";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/store/useStore";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <>{children}</>;
}
