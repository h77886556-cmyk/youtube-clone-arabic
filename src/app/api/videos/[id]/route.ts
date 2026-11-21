// GET /api/videos/[id] — تفاصيل فيديو + زيادة المشاهدات لاحقاً عبر /view
// PATCH — تعديل (المالك فقط) | DELETE — حذف (المالك أو الأدمن)
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";
import { videoUpdateSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [video, likes] = await Promise.all([
    prisma.video.findUnique({
      where: { id: params.id },
      include: {
        channel: { select: { id: true, name: true, handle: true, avatarUrl: true, description: true,
          _count: { select: { subscribers: true } } } },
        tags: { include: { tag: true } },
        _count: { select: { comments: true } },
      },
    }),
    // عدّ الإعجابات فقط (type = LIKE) — فـ _count.likes كان يعدّ عدم الإعجاب أيضاً
    prisma.like.count({ where: { videoId: params.id, type: "LIKE" } }),
  ]);
  if (!video) return jsonError("الفيديو غير موجود", 404);
  return Response.json({ video: { ...video, _count: { likes, comments: video._count.comments } } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video) return jsonError("الفيديو غير موجود", 404);
  if (video.authorId !== user.id && user.role !== "ADMIN") return jsonError("غير مصرح", 403);

  const parsed = videoUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(parsed.error.issues[0].message, 422);
  const { tags, ...data } = parsed.data;
  const updated = await prisma.video.update({
    where: { id: params.id },
    data: {
      ...data,
      ...(tags ? { tags: { deleteMany: {}, create: tags.map((name) => ({ tag: { connectOrCreate: { where: { name }, create: { name } } } })) } } : {}),
    },
  });
  return Response.json({ video: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video) return jsonError("الفيديو غير موجود", 404);
  if (video.authorId !== user.id && user.role !== "ADMIN") return jsonError("غير مصرح", 403);
  await prisma.video.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
