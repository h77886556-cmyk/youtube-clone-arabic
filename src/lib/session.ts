// جلسة المستخدم الحالية من الخادم
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user as { id: string; name?: string | null; email?: string | null; image?: string | null; role?: string } | undefined;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
