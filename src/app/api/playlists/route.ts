// GET /api/playlists — قوائم المستخدم
// POST /api/playlists — إنشاء قائمة | إضافة فيديو { playlistId, videoId, action: "add"|"remove" }
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";
import { playlistSchema } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id }, orderBy: { createdAt: "desc" },
    include: { items: { include: { video: { select: { id: true, title: true, thumbnailUrl: true, duration: true, views: true, createdAt: true, channel: { select: { id: true, name: true, handle: true, avatarUrl: true } } } } }, orderBy: { position: "asc" } } },
  });
  return Response.json({ playlists });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const body = await req.json();
  // إضافة/حذف فيديو من قائمة موجودة — القائمة يجب أن تكون ملك المستخدم
  if (body.playlistId && body.videoId) {
    const owned = await prisma.playlist.findFirst({ where: { id: body.playlistId, userId: user.id } });
    if (!owned) return jsonError("القائمة غير موجودة", 404);
    if (body.action === "remove") {
      await prisma.playlistItem.deleteMany({ where: { playlistId: body.playlistId, videoId: body.videoId } });
      return Response.json({ ok: true, added: false });
    }
    const count = await prisma.playlistItem.count({ where: { playlistId: body.playlistId } });
    const item = await prisma.playlistItem.upsert({
      where: { playlistId_videoId: { playlistId: body.playlistId, videoId: body.videoId } },
      update: {}, create: { playlistId: body.playlistId, videoId: body.videoId, position: count },
    });
    return Response.json({ ok: true, added: true, item }, { status: 201 });
  }
  const parsed = playlistSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0].message, 422);
  const playlist = await prisma.playlist.create({ data: { ...parsed.data, userId: user.id } });
  return Response.json({ playlist }, { status: 201 });
}
