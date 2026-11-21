// شريط البحث — ينتقل إلى /search?q=...
"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };
  return (
    <form onSubmit={submit} className="flex flex-1 max-w-xl items-center">
      <input
        value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن فيديو أو قناة..."
        className="w-full rounded-s-full border border-gray-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700"
      />
      <button type="submit" aria-label="بحث" className="rounded-e-full border border-s-0 border-gray-300 bg-gray-100 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800">
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}
