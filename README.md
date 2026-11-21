# عربي تيوب — YouTube Clone عربي (RTL)

تطبيق ويب عربي كامل شبيه باليوتيوب: رفع ومشاهدة فيديوهات، بحث نصي، اشتراكات،
تعليقات متداخلة، قوائم تشغيل، سجل مشاهدة مع استئناف، إشعارات، استوديو قناة، ولوحة أدمن.

## التقنيات

| الطبقة | التقنية |
|---|---|
| Frontend | Next.js 14 App Router + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Credentials + Google OAuth) |
| التخزين | Cloudinary (فيديو + صور مصغرة، HLS) |
| State | Zustand (واجهة) + React Query (بيانات) |
| التحقق | Zod + Rate Limiting |

## هيكل المشروع

```
youtube-clone-arabic/
├── prisma/
│   ├── schema.prisma      # كل الموديلات والعلاقات والفهارس
│   └── seed.ts            # أدمن + تصنيفات
├── src/
│   ├── app/
│   │   ├── layout.tsx     # RTL + خط Cairo + Providers
│   │   ├── page.tsx       # الرئيسية (feed + فلترة)
│   │   ├── watch/[id]/    # المشاهدة + مقترحات
│   │   ├── search/        # البحث
│   │   ├── channel/[id]/  # صفحة القناة
│   │   ├── studio/        # الاستوديو + الرفع
│   │   ├── history/ liked/ subscriptions/ trending/
│   │   ├── playlists/ notifications/ admin/ auth/signin/
│   │   └── api/           # كل الـ API Routes (انظر الجدول)
│   ├── components/        # Header, Sidebar, VideoCard, VideoPlayer,
│   │                      # Comments, UploadForm, SearchBar, ThemeToggle,
│   │                      # SaveToPlaylist (حفظ فيديو في قائمة من صفحة المشاهدة)
│   ├── hooks/useVideos.ts # React Query: feed + بحث + فيديو
│   ├── store/useStore.ts  # Zustand: sidebar + theme
│   └── lib/               # prisma, auth, cloudinary, utils,
│                          # validations (zod), rate-limit, session
├── .env.example
├── package.json
└── README.md
```

## التشغيل

```bash
# 1) المتطلبات: Node.js 18+ و PostgreSQL يعمل محلياً
cp .env.example .env        # ثم املأ DATABASE_URL و DIRECT_URL (نفس القيمة محلياً) و NEXTAUTH_SECRET و Cloudinary و Google
npm install
npx prisma migrate dev --name init   # أو: npx prisma db push
npm run db:seed             # أدمن تجريبي: admin@example.com / admin1234
npm run dev                 # http://localhost:3000
```

## النشر على Vercel

عشان التطبيق يبقى أونلاين وتشاركه مع صحابك على نفس قاعدة البيانات — اتبع
الدليل الكامل خطوة بخطوة في [DEPLOY.md](sandbox://workspace/youtube-clone-arabic/DEPLOY.md)
(GitHub ← Vercel ← Neon PostgreSQL ← Cloudinary ← Google OAuth)،
وملخصه: ارفع الكود على GitHub، اعمل مشروع Vercel واربطه بالريبو، حط متغيرات
البيئة من `.env.example` (و `NEXTAUTH_URL` = رابط Vercel)، شغّل
`npx prisma migrate deploy` على قاعدة Neon، ثم `npm run db:seed` للأدمن.

> ملاحظة: الرفع في `UploadForm` يستخدم unsigned upload preset في Cloudinary
> (الاسم الافتراضي `youtube-clone`) — أنشئه من لوحة Cloudinary، أو ارفع عبر
> API موقّع من الخادم. تفعيل البحث النصي الكامل يتطلب ملء `searchVector`
> (انظر تعليق الـ migration أدناه).

### تفعيل Full-Text Search في PostgreSQL

```sql
-- بعد أول migrate، نفّذ في قاعدة البيانات:
CREATE INDEX video_search_idx ON "Video" USING GIN ("searchVector");
-- وحدّث searchVector عند الإنشاء/التعديل، مثلاً عبر trigger:
-- to_tsvector('arabic', coalesce(title,'') || ' ' || coalesce(description,''))
```

## جدول API Endpoints

| الطريقة | المسار | الوصف | مصادقة |
|---|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth (Google + Credentials) | — |
| GET | `/api/videos?page&limit&sort=latest\|views\|trending&categoryId&channelId` | خلاصة الفيديوهات | — |
| POST | `/api/videos` | إنشاء فيديو (بيانات وصفية) | ✅ |
| GET/PATCH/DELETE | `/api/videos/[id]` | تفاصيل / تعديل / حذف (المالك أو أدمن) | ✅ للتعديل |
| POST | `/api/videos/[id]/view` | تسجيل مشاهدة + حفظ موضع الاستئناف `{progress}` | اختياري |
| POST | `/api/videos/[id]/like` | إعجاب/عدم إعجاب `{type: LIKE\|DISLIKE}` (toggle) | ✅ |
| GET | `/api/search?q=&type=videos\|channels&page=` | بحث نصي كامل (tsvector مع بديل ILIKE) | — |
| GET/POST | `/api/comments?videoId=` | تعليقات فيديو / إضافة تعليق أو رد | ✅ للنشر |
| DELETE/POST | `/api/comments/[id]` | حذف تعليق / إعجاب بتعليق | ✅ |
| GET/POST | `/api/subscriptions` | قنواتي / اشتراك-إلغاء `{channelId}` (toggle) | ✅ |
| GET/POST | `/api/playlists` | قوائمي / إنشاء قائمة / إضافة-حذف فيديو | ✅ |
| GET/DELETE | `/api/playlists/[id]` | قائمة واحدة مع فيديوهاتها / حذفها (المالك) | ✅ للحذف |
| GET/DELETE | `/api/history` | سجل المشاهدة / مسح السجل | ✅ |
| GET/PATCH | `/api/notifications` | الإشعارات / تعليم الكل كمقروء | ✅ |
| GET | `/api/channels/[id]` | صفحة قناة + حالة الاشتراك | اختياري |
| GET | `/api/studio/stats` | إحصائيات القناة (مشاهدات/مشتركون/إعجابات) | ✅ |
| GET/PATCH | `/api/admin/users` | قائمة المستخدمين / تغيير الدور | 👑 أدمن |

## الصفحات

`/` الرئيسية · `/watch/[id]` · `/search?q=` · `/channel/[id]` · `/studio` ·
`/studio/upload` · `/playlist/[id]` · `/playlists` · `/history` · `/liked` ·
`/subscriptions` · `/trending` · `/notifications` · `/admin` · `/auth/signin`

- الإعجاب بفيديو يضيفه تلقائياً إلى قائمة "الفيديوهات المعجبة" الخاصة (`isLiked`)،
  وإلغاء الإعجاب أو عدم الإعجاب يزيله منها — فصفحة `/liked` تعرض الإعجابات فعلاً.
- زر "حفظ" في صفحة المشاهدة (`SaveToPlaylist`): إضافة الفيديو لأي قائمة
  (منها "المشاهدة لاحقاً") أو إزالته منها، وإنشاء قائمة جديدة من نفس القائمة
  المنسدلة — مع تحقق من ملكية القائمة في `POST /api/playlists`.

## ملاحظات

- الواجهة RTL كاملة (`dir="rtl"`) بخط Cairo، ووضع فاتح/داكن عبر Zustand + `class="dark"`.
- استئناف المشاهدة: آخر موضع يُحفظ في `localStorage` و `WatchHistory.progress` كل 5 ثوانٍ.
- الأمان: تحقق Zod لكل المدخلات، Rate Limiting على الرفع، تحقق من الملكية/الدور في كل تعديل أو حذف.
- لم يُنفَّذ بعد (توسعات): HLS عبر Video.js، Algolia، إشعارات لحظية، معالجة فيديو خلفية.
