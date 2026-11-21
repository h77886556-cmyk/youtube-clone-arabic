// POST /api/videos/[id]/view — تسجيل مشاهدة + حفظ موضع الاستئناف
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const { progress = 0 } = await req.json().catch(() => ({}));
  // زيادة العداد (ذرياً)
  await prisma.video.update({ where: { id: params.id }, data: { views: { increment: 1 } } }).catch(() => null);
  // حفظ موضع المشاهدة للمستخدم المسجل
  if (user) {
    await prisma.watchHistory.upsert({
      where: { userId_videoId: { userId: user.id, videoId: params.id } },
      update: { progress, watchedAt: new Date() },
      create: { userId: user.id, videoId: params.id, progress },
    });
  }
  return Response.json({ ok: true });
}
