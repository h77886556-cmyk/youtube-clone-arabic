// التحقق من المدخلات بـ Zod — حماية من بيانات غير صالحة و XSS
import { z } from "zod";

export const videoSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب").max(100),
  description: z.string().max(5000).optional().default(""),
  videoUrl: z.string().url("رابط الفيديو غير صالح"),
  thumbnailUrl: z.string().url().optional().nullable(),
  duration: z.number().int().min(0).default(0),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("PUBLIC"),
});

export const videoUpdateSchema = videoSchema.partial().omit({ videoUrl: true });

export const commentSchema = z.object({
  content: z.string().min(1, "التعليق فارغ").max(1000),
  videoId: z.string().min(1),
  parentId: z.string().optional().nullable(),
});

export const playlistSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("PRIVATE"),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email("بريد غير صالح"),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
});

export const reportSchema = z.object({
  reason: z.enum(["SPAM", "VIOLENCE", "HATE_SPEECH", "COPYRIGHT", "MISINFORMATION", "OTHER"]),
  details: z.string().max(1000).optional(),
  videoId: z.string().optional(),
  commentId: z.string().optional(),
});

export type VideoInput = z.infer<typeof videoSchema>;
