// POST /api/auth/change-password — تغيير كلمة المرور للمستخدم الحالي
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, jsonError } from "@/lib/session";
import { changePasswordSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("يجب تسجيل الدخول", 401);
  const parsed = changePasswordSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(parsed.error.issues[0].message, 422);
  const { currentPassword, newPassword } = parsed.data;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { password: true } });
  if (!dbUser?.password) return jsonError("هذا الحساب بلا كلمة مرور (تسجيل عبر Google)", 422);
  const ok = await bcrypt.compare(currentPassword, dbUser.password);
  if (!ok) return jsonError("كلمة المرور الحالية غير صحيحة", 403);

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return Response.json({ ok: true });
}
