// POST /api/videos/[id]/view — تسجيل مشاهدة + حفظ موضع الاستئناف
// body: { progress?: number, countView?: boolean }
// العدّاد يزيد فقط عندما يكون countView=true (أول تشغيل)؛
// استدعاءات حفظ التقدّم ترسل countView=false فلا تزيد العدّاد
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const { progress = 0, countView = false } = await req.json().catch(() => ({}));
  // زيادة العداد (ذرياً) — مرة واحدة فقط لكل تشغيل
  if (countView) {
    await prisma.video.update({ where: { id: params.id }, data: { views: { increment: 1 } } }).catch(() => null);
  }
  // حفظ موضع المشاهدة للمستخدم المسجل
  if (user) {
    await prisma.watchHistory.upsert({
      where: { userId_videoId: { userId: user.id, videoId: params.id } },
      update: { progress, watchedAt: new Date() },
      create: { userId: user.id, videoId: params.id, progress },
    }).catch(() => null);
  }
  return Response.json({ ok: true });
}
