# النشر على Vercel — دليل خطوة بخطوة

الهدف: التطبيق يبقى أونلاين على رابط واحد، أنت وصحابك تدخلوا عليه وتشوفوا
فيديوهات بعض — يعني نفس التطبيق ونفس قاعدة البيانات للكل.

> **مهم قبل ما تبدأ:** النشر نفسه محتاج حساباتك أنت (GitHub و Vercel و Neon
> و Cloudinary)، ومحدش يقدر يعمله من هنا من غير ما تدخل بحساباتك. الدليل ده
> بيجهّزك تمشي الخطوات بنفسك واحدة واحدة، وكلها حسابات مجانية للبداية.

## اللي هتحتاجه

| الخدمة | ليه؟ | مجانية؟ |
|---|---|---|
| GitHub | تخزين الكود وربطه بـ Vercel | أيوه |
| Vercel | استضافة التطبيق (Next.js) | أيوه (Hobby) |
| Neon | قاعدة بيانات PostgreSQL أونلاين | أيوه (مشروع مجاني، مساحة صغيرة تكفي للبداية) |
| Cloudinary | تخزين الفيديوهات والصور المصغرة | أيوه (25GB تقريباً) |
| Google Cloud | تسجيل الدخول بجوجل (اختياري — التسجيل بالإيميل شغال من غيره) | أيوه |

## الخطوة 1: ارفع الكود على GitHub

1. اعمل حساب على [github.com](https://github.com) لو معندكش، واعمل ريبو جديد
   (New repository) وليكن اسمه `youtube-clone-arabic` — سيبه Public أو Private،
   الاتنين شغالين مع Vercel.
2. من فولدر المشروع على جهازك شغّل:

```bash
cd youtube-clone-arabic
git init
git add .
git commit -m "YouTube clone - first version"
git branch -M main
git remote add origin https://github.com/<اسمك>/youtube-clone-arabic.git
git push -u origin main
```

> ملحوظة: ملف `.env` مش هيترفع (موجود في `.gitignore`) — ودي حاجة صح،
> الأسرار بتتحط في Vercel مش في الكود.

## الخطوة 2: اعمل قاعدة بيانات على Neon

1. اعمل حساب على [neon.tech](https://neon.tech) واعمل مشروع جديد
   (Create project) — اختار أقرب منطقة ليك (مثلاً Europe).
2. من لوحة المشروع افتح **Dashboard ← Connection Details** وهتلاقي رابطين:
   - **Pooled connection** (فيه `pooler` أو `-pooler` في الرابط): ده هيبقى
     `DATABASE_URL` — تأكد إن آخره `?sslmode=require`.
   - **Direct connection** (من غير pooler): ده هيبقى `DIRECT_URL`.
3. احتفظ بالرابطين في ملف عندك مؤقتاً — هتحتاجهم في الخطوة اللي بعدها.
   شكلهم كده:
   ```
   DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/youtube_clone?sslmode=require"
   DIRECT_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/youtube_clone?sslmode=require"
   ```

## الخطوة 3: اعمل مشروع على Vercel واربطه

1. اعمل حساب على [vercel.com](https://vercel.com) — سجّل دخول بـ GitHub
   (أسهل طريقة، وده بيربط الحسابين).
2. اضغط **Add New ← Project**، واختار ريبو `youtube-clone-arabic` من القايمة
   واضغط **Import**. الـ Framework هيتكتشف لوحده `Next.js` — سيب كل الإعدادات
   زي ما هي (الـ build command موجود في `vercel.json`).
3. **قبل ما تدوس Deploy** افتح **Environment Variables** وحط المتغيرات دي
   (كلها من `.env.example`):

| المتغير | القيمة |
|---|---|
| `DATABASE_URL` | رابط الـ pooled من Neon (الخطوة 2) |
| `DIRECT_URL` | رابط الـ direct من Neon |
| `NEXTAUTH_SECRET` | سر عشوائي — ولّده من جهازك بـ `openssl rand -base64 32` وانسخ الناتج |
| `NEXTAUTH_URL` | رابط Vercel بتاعك، مثال: `https://youtube-clone-arabic.vercel.app` (من غير `/` في الآخر) |
| `GOOGLE_CLIENT_ID` | من Google (الخطوة 6) — ممكن تسيبه فاضي دلوقتي |
| `GOOGLE_CLIENT_SECRET` | من Google (الخطوة 6) — ممكن تسيبه فاضي دلوقتي |
| `CLOUDINARY_CLOUD_NAME` | من لوحة Cloudinary |
| `CLOUDINARY_API_KEY` | من لوحة Cloudinary |
| `CLOUDINARY_API_SECRET` | من لوحة Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | نفس الـ Cloud Name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `youtube-clone` |

4. دوس **Deploy** واستنى دقيقة — هيطلع لك رابط التطبيق.

> لو عدّلت أي متغير بعد كده، لازم تعمل **Redeploy** من تبويب Deployments
> (النقاط التلاتة جنب آخر deployment ← Redeploy) عشان التغيير يتطبّق.

## الخطوة 4: جهّز قاعدة البيانات (migrations + الأدمن)

الـ deploy لوحده مش بيعمل جداول قاعدة البيانات — لازم تشغّل الـ migrations
مرة واحدة من جهازك، والرابطين بتوع Neon هما اللي هيتواصلوا مع قاعدة الإنتاج:

```bash
# من فولدر المشروع على جهازك — حط رابطي Neon مكان القيم:
DATABASE_URL="postgresql://...pooler...?sslmode=require" \
DIRECT_URL="postgresql://...direct...?sslmode=require" \
npx prisma migrate deploy
```

بعدها اعمل الأدمن التجريبي (نفس الأمر بس seed):

```bash
DATABASE_URL="postgresql://...pooler...?sslmode=require" \
npx prisma db:seed
```

الأدمن: `admin@example.com` / كلمة المرور `admin1234` — **غيّرها فوراً بعد
أول دخول** من صفحة الأدمن `/admin`.

## الخطوة 5: إعداد الرفع في Cloudinary

من غير الخطوة دي الرفع هيفشل — التطبيق بيرفع الفيديو مباشرة لـ Cloudinary
بـ unsigned preset:

1. اعمل حساب على [cloudinary.com](https://cloudinary.com) وخد الـ Cloud Name
   والـ API Key والـ API Secret من الـ Dashboard وحطهم في Vercel (الخطوة 3).
2. روح **Settings (الترس) ← Upload ← Add upload preset**:
   - **Preset name:** `youtube-clone` (لازم يطابق المتغير بالظبط)
   - **Signing Mode:** اختار **Unsigned**
   - سيب باقي الإعدادات زي ما هي، ودوس **Save**.

## الخطوة 6: تسجيل الدخول بجوجل (اختياري)

التسجيل بالإيميل وكلمة المرور شغال من غير الخطوة دي. لو عايز زر Google كمان:

1. روح [Google Cloud Console](https://console.cloud.google.com) واعمل مشروع جديد.
2. **APIs & Services ← OAuth consent screen**: اختار External، املأ الاسم
   والإيميل، واحفظ.
3. **APIs & Services ← Credentials ← Create Credentials ← OAuth client ID**:
   نوع التطبيق **Web application**.
4. في **Authorized redirect URIs** ضيف بالظبط:
   ```
   https://<رابط-Vercel-بتاعك>/api/auth/callback/google
   ```
   مثال: `https://youtube-clone-arabic.vercel.app/api/auth/callback/google`
5. انسخ الـ **Client ID** والـ **Client Secret** وحطهم في متغيرات Vercel
   (`GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET`)، وبعدين اعمل Redeploy.

## الخطوة 7: شارك الرابط مع صحابك

1. ابعت لهم رابط Vercel (مثال: `https://youtube-clone-arabic.vercel.app`).
2. كل واحد يسجّل حساب من صفحة التسجيل (إيميل + كلمة مرور، أو Google).
3. أول ما يرفع أول فيديو من **Studio ← رفع** بتتعمل له قناة تلقائياً باسمه،
   والفيديو بيظهر في الرئيسية لكل اللي داخلين على نفس الرابط.
4. يقدروا يشتركوا في قنوات بعض، ويحطوا إعجاب وتعليقات، ويحفظوا في قوائم تشغيل.

## حدود الخطة المجانية (باختصار)

- **Vercel Hobby:** استضافة مجانية، ولو زاد الاستهلاك جداً ممكن يطلب ترقية —
  للبداية ولصحابك كفاية.
- **Neon Free:** مساحة تخزين صغيرة وعدد ساعات تشغيل محدود شهرياً — كفاية
  للتجربة، ولو كبرتوا اعملوا ترقية.
- **Cloudinary Free:** حوالي 25GB تخزين/نقل — الفيديوهات الكبيرة والكثيرة
  بتخلصها بسرعة، فخلي بالك من حجم الملفات المرفوعة.
- **Rate Limiting:** معمول في ذاكرة كل سيرفر (مش مشترك بين السيرفرات)، ففي
  الإنتاج هو حماية خفيفة بس، مش حد صارم — لو احتجت حد صارم استخدم Upstash Redis.

## أشهر المشاكل وحلها

| المشكلة | السبب غالباً | الحل |
|---|---|---|
| الـ Build بيفشل على Vercel | متغير ناقص أو اعتماد ناقص | راجع سجل الـ Build في Vercel، وتأكد إن كل متغيرات `.env.example` موجودة |
| `Module not found: @next-auth/prisma-adapter` | كان ناقص من `package.json` | اتصلّح خلاص في المشروع — تأكد إنك رفعت آخر نسخة على GitHub |
| صفحة بيضاء / خطأ 500 بعد النشر | `DATABASE_URL` غلط أو من غير `?sslmode=require` | صحّح الرابط في Vercel واعمل Redeploy |
| `prisma migrate deploy` بيفشل | استخدمت رابط الـ pool بدل الـ direct | استخدم `DIRECT_URL` (الرابط المباشر) في أمر الـ migrate |
| تسجيل الدخول بجوجل بيرجع خطأ | الـ redirect URI مش مطابق | راجع الخطوة 6 — لازم يطابق رابط Vercel بالظبط |
| الرفع بيفشل برسالة preset | الـ preset مش موجود أو اسمه مختلف | راجع الخطوة 5 — الاسم لازم `youtube-clone` و Unsigned |
| الصور المصغرة مش بتظهر | دومين الصور مش مسموح | `next.config.js` فيه `res.cloudinary.com` أصلاً — تأكد إنك رفعت آخر نسخة |
| البحث النصي مش شغال | `searchVector` فاضي | نفّذ الـ SQL بتاع الـ Full-Text Search من README على قاعدة Neon |
