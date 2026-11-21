// مزود الجلسة — غلاف Client Component لـ SessionProvider
// (لا يمكن استخدام SessionProvider مباشرة في Server Component مثل layout.tsx
// لأنه يعتمد على React Context، فيفشل توليد الصفحات أثناء البناء)
"use client";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function SessionProviderWrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
