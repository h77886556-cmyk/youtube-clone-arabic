// GET /api/search?q=...&type=videos|channels&page=1
// بحث نصي: PostgreSQL full-text عبر searchVector، مع بديل ILIKE عند عدم وجوده
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "videos";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 12;
  if (!q) return Response.json({ videos: [], channels: [], pagination: { page, total: 0, pages: 0 } });

  if (type === "channels") {
    const channels = await prisma.channel.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { handle: { contains: q, mode: "insensitive" } }] },
      take: limit, skip: (page - 1) * limit,
      include: { _count: { select: { subscribers: true, videos: true } } },
    });
    return Response.json({ channels, videos: [], pagination: { page, total: channels.length, pages: 1 } });
  }

  // بحث نصي كامل — يفضّل tsvector، ويعود إلى ILIKE عند الفشل
  let videos: unknown[] = [];
  try {
    videos = await prisma.$queryRaw`
      SELECT v.* FROM "Video" v
      WHERE v."visibility" = 'PUBLIC' AND v."status" = 'READY'
        AND v."searchVector" @@ plainto_tsquery('arabic', ${q})
      ORDER BY ts_rank(v."searchVector", plainto_tsquery('arabic', ${q})) DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
  } catch {
    videos = await prisma.video.findMany({
      where: { visibility: "PUBLIC", status: "READY",
        OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
      orderBy: { views: "desc" }, take: limit, skip: (page - 1) * limit,
      include: { channel: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    });
  }
  return Response.json({ videos, channels: [], pagination: { page, total: (videos as unknown[]).length, pages: 1 } });
}
