// GET /api/playlists/[id] — قائمة واحدة مع فيديوهاتها
// DELETE /api/playlists/[id] — حذف القائمة (المالك فقط)
// القوائم الخاصة لا تظهر إلا لمالكها؛ القوائم العامة تظهر للجميع.
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const playlist = await prisma.playlist.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true } },
      items: {
        orderBy: { position: "asc" },
        include: {
          video: {
            select: {
              id: true, title: true, thumbnailUrl: true, duration: true,
              views: true, createdAt: true,
              channel: { select: { id: true, name: true, handle: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });
  if (!playlist) return jsonError("القائمة غير موجودة", 404);
  if (playlist.visibility !== "PUBLIC" && (!user || user.id !== playlist.userId)) {
    return jsonError("القائمة غير موجودة", 404);
  }
  return Response.json({ playlist });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const playlist = await prisma.playlist.findUnique({ where: { id: params.id } });
  if (!playlist) return jsonError("القائمة غير موجودة", 404);
  if (playlist.userId !== user.id) return jsonError("غير مسموح", 403);
  await prisma.playlist.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}
