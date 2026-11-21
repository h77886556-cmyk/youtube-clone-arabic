// بذرة أولية — أدمن + تصنيفات + فيديوهات تجريبية
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "الأدمن", email: "admin@example.com", password, role: "ADMIN" },
  });
  await prisma.channel.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, name: "قناة عربي تيوب", handle: "@arabtube", description: "قناة تجريبية" },
  });
  for (const [name, slug] of [["ترفيه", "entertainment"], ["تعليم", "education"], ["تقنية", "tech"], ["رياضة", "sports"]]) {
    await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
  console.log("Seed done:", admin.email);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
