// تسجيل الدخول — بريد + Google
"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("بيانات الدخول غير صحيحة");
    else window.location.href = "/";
  };
  return (
    <div className="mx-auto max-w-sm rounded-xl border p-6 dark:border-zinc-800">
      <h1 className="mb-4 text-xl font-bold">تسجيل الدخول</h1>
      <form onSubmit={submit} className="space-y-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" required className="w-full rounded-lg border px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-lg bg-red-600 py-2 text-white">دخول</button>
      </form>
      <button onClick={() => signIn("google", { callbackUrl: "/" })} className="mt-3 w-full rounded-lg border py-2 text-sm dark:border-zinc-700">الدخول عبر Google</button>
      <p className="mt-4 text-center text-sm text-gray-500">
        ليس لديك حساب؟ <Link href="/auth/signup" className="text-blue-600 hover:underline">إنشاء حساب جديد</Link>
      </p>
    </div>
  );
}
