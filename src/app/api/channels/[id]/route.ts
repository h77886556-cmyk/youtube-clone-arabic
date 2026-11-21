// GET /api/channels/[id] — صفحة قناة عامة: بيانات + فيديوهاتها + حالة الاشتراك
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const channel = await prisma.channel.findUnique({
    where: { id: params.id },
    include: {
      videos: { where: { visibility: "PUBLIC", status: "READY" }, orderBy: { createdAt: "desc" }, take: 24 },
      _count: { select: { subscribers: true, videos: true } },
    },
  });
  if (!channel) return Response.json({ error: "القناة غير موجودة" }, { status: 404 });
  const user = await getCurrentUser();
  const subscribed = user
    ? !!(await prisma.subscription.findUnique({ where: { subscriberId_channelId: { subscriberId: user.id, channelId: channel.id } } }))
    : false;
  return Response.json({ channel, subscribed });
}
