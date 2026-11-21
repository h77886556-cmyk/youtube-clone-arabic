// Cloudinary — رفع الفيديوهات والصور المصغرة
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/** يبني رابط فيديو بجودة متكيفة (HLS عبر Cloudinary عند توفره) */
export function videoUrl(publicId: string) {
  return cloudinary.url(publicId, { resource_type: "video", streaming_profile: "auto", format: "m3u8" });
}

/** صورة مصغرة مولّدة تلقائياً من منتصف الفيديو */
export function autoThumbnail(publicId: string) {
  return cloudinary.url(publicId, { resource_type: "video", format: "jpg", transformation: [{ width: 1280, height: 720, crop: "fill" }] });
}
