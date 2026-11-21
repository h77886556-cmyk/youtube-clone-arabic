// POST /api/videos/[id]/like — إعجاب / عدم إعجاب / إلغاء
// body: { type: "LIKE" | "DISLIKE" } — إرسال نفس النوع مرة أخرى يلغي التفاعل
// الإعجاب يضيف الفيديو تلقائياً إلى قائمة "الفيديوهات المعجبة" (Playlist خاصة isLiked)،
// وإلغاء الإعجاب أو التبديل إلى عدم إعجاب يزيله منها — فتظهر صفحة /liked بشكل صحيح.
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";


// قائمة Liked الخاصة بالمستخدم — تُنشأ عند أول إعجاب إن لم تكن موجودة
async function getOrCreateLikedPlaylist(userId: string) {
  const existing = await prisma.playlist.findFirst({ where: { userId, isLiked: true } });
  if (existing) return existing;
  return prisma.playlist.create({
    data: { userId, title: "الفيديوهات المعجبة", isLiked: true, visibility: "PRIVATE" },
  });
}


async function removeFromLikedPlaylist(userId: string, videoId: string) {
  const liked = await prisma.playlist.findFirst({ where: { userId, isLiked: true } });
  if (!liked) return;
  await prisma.playlistItem.deleteMany({ where: { playlistId: liked.id, videoId } });
}


async function addToLikedPlaylist(userId: string, videoId: string) {
  const liked = await getOrCreateLikedPlaylist(userId);
  const count = await prisma.playlistItem.count({ where: { playlistId: liked.id } });
  await prisma.playlistItem.upsert({
    where: { playlistId_videoId: { playlistId: liked.id, videoId } },
    update: {},
    create: { playlistId: liked.id, videoId, position: count },
  });
}


export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const { type } = await req.json();
  if (!["LIKE", "DISLIKE"].includes(type)) return jsonError("نوع غير صالح", 422);


  const existing = await prisma.like.findUnique({
    where: { userId_videoId: { userId: user.id, videoId: params.id } },
  });
  if (existing && existing.type === type) {
    await prisma.like.delete({ where: { id: existing.id } });
    // إلغاء الإعجاب يزيل الفيديو من قائمة Liked
    if (type === "LIKE") await removeFromLikedPlaylist(user.id, params.id);
    return Response.json({ liked: null });
  }
  const like = await prisma.like.upsert({
    where: { userId_videoId: { userId: user.id, videoId: params.id } },
    update: { type },
    create: { userId: user.id, videoId: params.id, type },
  });
  // مزامنة قائمة Liked مع حالة الإعجاب
  if (type === "LIKE") await addToLikedPlaylist(user.id, params.id);
  else await removeFromLikedPlaylist(user.id, params.id);
  return Response.json({ liked: like.type });
}

