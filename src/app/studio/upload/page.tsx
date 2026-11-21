// صفحة الرفع في الاستوديو — للمسجلين فقط، والضيوف يُعاد توجيههم لتسجيل الدخول
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin");
  }, [status, router]);

  if (status === "loading") return <p>جارٍ التحميل...</p>;
  if (status === "unauthenticated") return <p>جارٍ تحويلك لتسجيل الدخول...</p>;
  return <UploadForm />;
}
