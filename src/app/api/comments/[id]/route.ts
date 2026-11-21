// DELETE /api/comments/[id] — حذف تعليق (صاحبه أو الأدمن)
// POST /api/comments/[id] — إعجاب بتعليق { type: "LIKE" }
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment) return jsonError("التعليق غير موجود", 404);
  if (comment.authorId !== user.id && user.role !== "ADMIN") return jsonError("غير مصرح", 403);
  await prisma.comment.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const existing = await prisma.like.findUnique({ where: { userId_commentId: { userId: user.id, commentId: params.id } } });
  if (existing) { await prisma.like.delete({ where: { id: existing.id } }); return Response.json({ liked: false }); }
  await prisma.like.create({ data: { userId: user.id, commentId: params.id, type: "LIKE" } });
  return Response.json({ liked: true });
}
