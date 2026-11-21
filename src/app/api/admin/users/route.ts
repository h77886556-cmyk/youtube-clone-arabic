// GET /api/admin/users — قائمة المستخدمين (أدمن فقط)
// PATCH /api/admin/users { userId, role } — تغيير الدور
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return jsonError("غير مصرح — أدمن فقط", 403);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }, take: 100,
    select: { id: true, name: true, email: true, image: true, role: true, createdAt: true,
      _count: { select: { videos: true, comments: true } } },
  });
  return Response.json({ users });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return jsonError("غير مصرح — أدمن فقط", 403);
  const { userId, role } = await req.json();
  if (!["USER", "ADMIN"].includes(role)) return jsonError("دور غير صالح", 422);
  const updated = await prisma.user.update({ where: { id: userId }, data: { role } });
  return Response.json({ user: { id: updated.id, role: updated.role } });
}
