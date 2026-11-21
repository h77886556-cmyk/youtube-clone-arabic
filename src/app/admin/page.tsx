// لوحة الإدارة — إدارة المستخدمين (أدمن فقط)
"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState<{ id: string; name?: string | null; email: string; role: string; createdAt: string; _count: { videos: number; comments: number } }[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin/users").then(async (r) => {
      if (!r.ok) { setError("غير مصرح — هذه الصفحة للأدمن فقط"); return; }
      const d = await r.json(); setUsers(d.users ?? []);
    });
  }, []);
  const setRole = async (userId: string, role: string) => {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role }) });
    setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
  };
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">لوحة الإدارة</h1>
      {error && <p className="text-red-600">{error}</p>}
      <table className="w-full text-sm">
        <thead><tr className="border-b text-start dark:border-zinc-800"><th className="py-2 text-start">الاسم</th><th className="text-start">البريد</th><th className="text-start">الدور</th><th className="text-start">فيديوهات</th><th className="text-start">إجراء</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b dark:border-zinc-800">
              <td className="py-2">{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u._count.videos}</td>
              <td><button onClick={() => setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")} className="text-blue-600">{u.role === "ADMIN" ? "إلغاء الأدمن" : "تعيين أدمن"}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
