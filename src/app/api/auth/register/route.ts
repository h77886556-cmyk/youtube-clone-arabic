// POST /api/auth/register — إنشاء حساب جديد + قناة له
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/session";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(parsed.error.issues[0].message, 422);
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return jsonError("هذا البريد مسجل بالفعل", 409);

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });
  // قناة افتراضية للمستخدم الجديد
  await prisma.channel.create({
    data: { userId: user.id, name, handle: `@user-${user.id.slice(-6)}` },
  });

  const { password: _password, ...safeUser } = user;
  return Response.json({ user: safeUser }, { status: 201 });
}
