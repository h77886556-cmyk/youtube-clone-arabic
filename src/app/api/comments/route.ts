// GET /api/comments?videoId=... — تعليقات فيديو (مع الردود)
// POST /api/comments — إضافة تعليق أو رد
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";
import { commentSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const videoId = new URL(req.url).searchParams.get("videoId");
  if (!videoId) return jsonError("videoId مطلوب", 422);
  const comments = await prisma.comment.findMany({
    where: { videoId, parentId: null },
    orderBy: { createdAt: "desc" }, take: 50,
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, name: true, image: true } } } },
      _count: { select: { likes: true } },
    },
  });
  return Response.json({ comments });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const parsed = commentSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(parsed.error.issues[0].message, 422);
  const comment = await prisma.comment.create({
    data: { ...parsed.data, authorId: user.id },
    include: { author: { select: { id: true, name: true, image: true } } },
  });
  // إشعار لصاحب الفيديو (ما لم يكن هو المعلق)
  const video = await prisma.video.findUnique({ where: { id: parsed.data.videoId }, select: { authorId: true, title: true } });
  if (video && video.authorId !== user.id) {
    await prisma.notification.create({
      data: { type: parsed.data.parentId ? "COMMENT_REPLY" : "COMMENT_REPLY", userId: video.authorId, actorId: user.id, videoId: video.id, message: `علّق ${user.name ?? "مستخدم"} على فيديوك: ${video.title}` },
    }).catch(() => null);
  }
  return Response.json({ comment }, { status: 201 });
}
