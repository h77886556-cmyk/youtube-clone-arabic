// GET /api/studio/stats — إحصائيات قناة المستخدم: مشاهدات، مشتركون، فيديوهات، تفاعل
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const channel = await prisma.channel.findUnique({ where: { userId: user.id }, include: { _count: { select: { subscribers: true } } } });
  if (!channel) return Response.json({ stats: { views: 0, subscribers: 0, videos: 0, likes: 0 }, videos: [] });

  const [agg, likes, videos] = await Promise.all([
    prisma.video.aggregate({ where: { channelId: channel.id }, _sum: { views: true }, _count: true }),
    prisma.like.count({ where: { video: { channelId: channel.id }, type: "LIKE" } }),
    prisma.video.findMany({ where: { channelId: channel.id }, orderBy: { createdAt: "desc" }, take: 20,
      include: { _count: { select: { likes: true, comments: true } } } }),
  ]);
  return Response.json({
    stats: { views: agg._sum.views ?? 0, subscribers: channel._count.subscribers, videos: agg._count, likes },
    videos,
  });
}
