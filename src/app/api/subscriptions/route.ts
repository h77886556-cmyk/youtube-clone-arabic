// GET /api/subscriptions — قنوات المشترك بها المستخدم
// POST /api/subscriptions { channelId } — اشتراك / إلغاء اشتراك (toggle)
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const subs = await prisma.subscription.findMany({
    where: { subscriberId: user.id }, orderBy: { createdAt: "desc" },
    include: { channel: { include: { _count: { select: { subscribers: true } } } } },
  });
  return Response.json({ subscriptions: subs });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const { channelId } = await req.json();
  if (!channelId) return jsonError("channelId مطلوب", 422);
  const channel = await prisma.channel.findUnique({ where: { id: channelId }, select: { userId: true, name: true } });
  if (!channel) return jsonError("القناة غير موجودة", 404);
  const existing = await prisma.subscription.findUnique({
    where: { subscriberId_channelId: { subscriberId: user.id, channelId } },
  });
  if (existing) {
    await prisma.subscription.delete({ where: { id: existing.id } });
    return Response.json({ subscribed: false });
  }
  const sub = await prisma.subscription.create({ data: { subscriberId: user.id, channelId } });
  if (channel && channel.userId !== user.id) {
    await prisma.notification.create({
      data: { type: "NEW_SUBSCRIBER", userId: channel.userId, actorId: user.id, message: `اشترك ${user.name ?? "مستخدم"} في قناتك ${channel.name}` },
    }).catch(() => null);
  }
  return Response.json({ subscribed: true, subscription: sub }, { status: 201 });
}
