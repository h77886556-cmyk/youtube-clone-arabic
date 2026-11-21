// GET /api/notifications — إشعارات المستخدم
// PATCH /api/notifications — تعليم الكل كمقروء
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50,
    include: { actor: { select: { id: true, name: true, image: true } } },
  });
  const unread = await prisma.notification.count({ where: { userId: user.id, isRead: false } });
  return Response.json({ notifications, unread });
}

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  return Response.json({ ok: true });
}
