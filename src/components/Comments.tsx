// التعليقات — إضافة تعليق + ردود متداخلة + إعجاب
"use client";
import { ThumbsUp, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";

interface CommentItem {
  id: string; content: string; createdAt: string;
  author: { id: string; name?: string | null; image?: string | null };
  replies?: CommentItem[];
  _count?: { likes: number };
}

export default function Comments({ videoId }: { videoId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  // نص كل رد مستقل عن نص التعليق الرئيسي (state مستقل لكل رد مفتوح)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const load = () => fetch(`/api/comments?videoId=${videoId}`).then((r) => r.json()).then((d) => setComments(d.comments ?? []));
  useEffect(() => { load(); }, [videoId]);

  const submit = async (parentId?: string | null) => {
    const content = parentId ? (replyTexts[parentId] ?? "") : text;
    if (!content.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, videoId, parentId: parentId ?? null }),
    });
    if (res.ok) {
      if (parentId) setReplyTexts((prev) => ({ ...prev, [parentId]: "" }));
      else setText("");
      setReplyTo(null); load();
    }
  };

  const like = (id: string) => fetch(`/api/comments/${id}`, { method: "POST" }).then(load);
  const remove = (id: string) => fetch(`/api/comments/${id}`, { method: "DELETE" }).then(load);

  const render = (c: CommentItem, depth = 0) => (
    <div key={c.id} className={depth ? "ms-10 mt-3 border-s-2 border-gray-200 ps-4 dark:border-zinc-700" : "mt-4"}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-700">{c.author.name?.[0]}</div>
        <div className="flex-1">
          <p className="text-sm"><b>{c.author.name}</b> <span className="text-gray-500">{timeAgo(c.createdAt)}</span></p>
          <p className="mt-1 text-sm">{c.content}</p>
          <div className="mt-1 flex gap-3 text-xs text-gray-500">
            <button onClick={() => like(c.id)} className="flex items-center gap-1 hover:text-black dark:hover:text-white"><ThumbsUp className="h-3.5 w-3.5" /> {c._count?.likes ?? 0}</button>
            <button onClick={() => setReplyTo(c.id)}>رد</button>
            {session?.user && (session.user as { id?: string }).id === c.author.id && (
              <button onClick={() => remove(c.id)} className="flex items-center gap-1 text-red-600"><Trash2 className="h-3.5 w-3.5" /> حذف</button>
            )}
          </div>
          {replyTo === c.id && (
            <div className="mt-2 flex gap-2">
              <input autoFocus value={replyTexts[c.id] ?? ""} onChange={(e) => setReplyTexts((prev) => ({ ...prev, [c.id]: e.target.value }))} placeholder="اكتب رداً..." className="flex-1 rounded-full border px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              <button onClick={() => submit(c.id)} className="rounded-full bg-blue-600 px-4 py-1.5 text-sm text-white">نشر</button>
            </div>
          )}
          {c.replies?.map((r) => render(r, depth + 1))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold">{comments.length} تعليق</h2>
      {session ? (
        <div className="mt-3 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="أضف تعليقاً..." className="flex-1 rounded-full border px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <button onClick={() => submit(null)} className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white">تعليق</button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">سجّل الدخول لإضافة تعليق.</p>
      )}
      <div>{comments.map((c) => render(c))}</div>
    </section>
  );
}
