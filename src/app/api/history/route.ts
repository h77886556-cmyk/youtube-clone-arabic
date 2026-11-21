// GET /api/history — سجل المشاهدة (الأحدث أولاً)
// DELETE /api/history — مسح السجل كاملاً
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const history = await prisma.watchHistory.findMany({
    where: { userId: user.id }, orderBy: { watchedAt: "desc" }, take: 100,
    include: { video: { include: { channel: { select: { id: true, name: true, avatarUrl: true } } } } },
  });
  return Response.json({ history });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  await prisma.watchHistory.deleteMany({ where: { userId: user.id } });
  return Response.json({ ok: true });
}
