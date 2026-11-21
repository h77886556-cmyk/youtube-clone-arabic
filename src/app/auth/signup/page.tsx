// إنشاء حساب جديد
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "تعذر إنشاء الحساب");
      router.push("/auth/signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm rounded-xl border p-6 dark:border-zinc-800">
      <h1 className="mb-4 text-xl font-bold">إنشاء حساب جديد</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" required minLength={2} maxLength={50} className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور (8 أحرف على الأقل)" required minLength={8} className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-red-600 py-2 text-white disabled:opacity-50">
          {busy ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        لديك حساب بالفعل؟ <Link href="/auth/signin" className="text-blue-600 hover:underline">تسجيل الدخول</Link>
      </p>
    </div>
  );
}
