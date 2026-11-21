// GET /api/videos — خلاصة الفيديوهات (pagination + فلترة)
// ?page=1&limit=12&sort=latest|views|trending&categoryId=...&channelId=...
// POST /api/videos — إنشاء فيديو (بيانات وصفية بعد الرفع إلى Cloudinary)
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";
import { videoSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

const PAGE_SIZE = 12;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // تحويل آمن: أي قيمة غير رقمية ترجع للافتراضي بدل NaN
  const rawPage = Number(searchParams.get("page") ?? 1);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const rawLimit = Number(searchParams.get("limit") ?? PAGE_SIZE);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(50, Math.floor(rawLimit)) : PAGE_SIZE;
  const sort = searchParams.get("sort") ?? "latest";
  const categoryId = searchParams.get("categoryId");
  const channelId = searchParams.get("channelId");

  const orderBy =
    sort === "views" ? { views: "desc" as const } :
    sort === "trending" ? [{ views: "desc" as const }, { createdAt: "desc" as const }] :
    { createdAt: "desc" as const };

  const where = {
    visibility: "PUBLIC" as const,
    status: "READY" as const,
    ...(categoryId ? { categoryId } : {}),
    ...(channelId ? { channelId } : {}),
  };

  const [videos, total, likeCounts] = await Promise.all([
    prisma.video.findMany({
      where, orderBy, skip: (page - 1) * limit, take: limit,
      include: {
        channel: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.video.count({ where }),
    // عدّ الإعجابات فقط (type = LIKE) — فـ _count.likes كان يعدّ عدم الإعجاب أيضاً
    prisma.like.groupBy({ by: ["videoId"], where: { type: "LIKE" }, _count: true }),
  ]);

  const likesMap = new Map(likeCounts.map((g) => [g.videoId, g._count]));
  const videosWithLikes = videos.map((v) => ({
    ...v,
    _count: { likes: likesMap.get(v.id) ?? 0, comments: v._count.comments },
  }));

  return Response.json({ videos: videosWithLikes, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const rl = rateLimit(`upload:${user.id}`, 10, 60_000);
  if (!rl.ok) return jsonError("طلبات كثيرة، حاول لاحقاً", 429);

  const body = await req.json();
  const parsed = videoSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0].message, 422);

  const { tags, ...data } = parsed.data;
  // قناة المستخدم (تُنشأ عند التسجيل أو أول رفع)
  let channel = await prisma.channel.findUnique({ where: { userId: user.id } });
  if (!channel) {
    channel = await prisma.channel.create({
      data: { userId: user.id, name: user.name ?? "قناتي", handle: `@user-${user.id.slice(-6)}` },
    });
  }

  const video = await prisma.video.create({
    data: {
      ...data,
      authorId: user.id,
      channelId: channel.id,
      tags: {
        create: tags.map((name) => ({
          tag: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      },
    },
    include: { channel: true },
  });
  return Response.json({ video }, { status: 201 });
}
