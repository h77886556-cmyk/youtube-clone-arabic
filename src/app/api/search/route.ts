// GET /api/search?q=...&type=videos|channels&page=1
// بحث نصي: PostgreSQL full-text عبر searchVector، مع بديل ILIKE عند عدم وجوده
// (searchVector يبقى NULL للفيديوهات التي لم يُحدَّث لها، فـ ILIKE يعمل مع العربية دائماً)
import { prisma } from "@/lib/prisma";

const LIMIT = 12;

// تحويل آمن لرقم الصفحة: أي قيمة غير رقمية ترجع للافتراضي 1
function parsePage(value: string | null): number {
  const n = Number(value ?? 1);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "videos";
  const page = parsePage(searchParams.get("page"));
  const limit = LIMIT;
  if (!q) return Response.json({ videos: [], channels: [], pagination: { page, total: 0, pages: 0 } });

  if (type === "channels") {
    const where = {
      OR: [{ name: { contains: q, mode: "insensitive" } }, { handle: { contains: q, mode: "insensitive" } }],
    };
    const [channels, total] = await Promise.all([
      prisma.channel.findMany({
        where, take: limit, skip: (page - 1) * limit,
        include: { _count: { select: { subscribers: true, videos: true } } },
      }),
      prisma.channel.count({ where }),
    ]);
    return Response.json({ channels, videos: [], pagination: { page, total, pages: Math.ceil(total / limit) } });
  }

  const ilikeWhere = {
    visibility: "PUBLIC" as const, status: "READY" as const,
    OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
  };
  const channelInclude = { channel: { select: { id: true, name: true, handle: true, avatarUrl: true } } };

  // بحث نصي كامل — يفضّل tsvector، ويعود إلى ILIKE عند الفشل أو عند صفر نتائج
  let videos: unknown[] = [];
  let total = 0;
  try {
    const rows = await prisma.$queryRaw<Record<string, unknown>[]>`SELECT v.* FROM "Video" v WHERE v."visibility" = 'PUBLIC' AND v."status" = 'READY' AND v."searchVector" @@ plainto_tsquery('arabic', ${q}) ORDER BY ts_rank(v."searchVector", plainto_tsquery('arabic', ${q})) DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
    if (rows.length > 0) {
      videos = rows;
      const counted = await prisma.$queryRaw<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM "Video" v WHERE v."visibility" = 'PUBLIC' AND v."status" = 'READY' AND v."searchVector" @@ plainto_tsquery('arabic', ${q})`;
      total = counted[0]?.count ?? rows.length;
    }
  } catch {
    // يعود إلى ILIKE أدناه
  }
  if (videos.length === 0) {
    [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: ilikeWhere, orderBy: { views: "desc" }, take: limit, skip: (page - 1) * limit,
        include: channelInclude,
      }),
      prisma.video.count({ where: ilikeWhere }),
    ]);
  }
  return Response.json({ videos, channels: [], pagination: { page, total, pages: Math.ceil(total / limit) } });
}
