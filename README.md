# سيرنا — Sairna

واجهة عربية (RTL) لحجز الرحلات بين المحافظات السورية، مبنية بـ **React + TypeScript** ومتصلة بخادم **SAIRNA API** عبر HTTP.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-087EA4?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img alt="TanStack Query" src="https://img.shields.io/badge/TanStack%20Query-5-FF4154?logo=reactquery&logoColor=white" />
  <img alt="React Router" src="https://img.shields.io/badge/React%20Router-6-CA4245?logo=reactrouter&logoColor=white" />
</p>

---

## عن المشروع

سيرنا تطبيق واجهة كامل يغطي دورة السفر من البداية للنهاية: البحث عن رحلة بين محافظتين، مقارنة الشركات والأوقات، اختيار المقاعد، إدخال بيانات المسافرين، تأكيد الحجز، ثم متابعة الرحلة وعرض التذكرة.

الواجهة تتصل مباشرة بخادم `SAIRNA API` — لا بيانات وهمية ولا محاكاة للحجوزات: المدن والشركات والرحلات والمقاعد والحجوزات كلها تُقرأ وتُكتب على الخادم.

**نطاق هذا المستودع:** الواجهة الأمامية (Frontend) فقط. الـ Backend وقاعدة البيانات يُداران خارج هذا المشروع.

---

## الميزات

- **مصادقة حقيقية:** تسجيل حساب ودخول، وإرسال توكن JWT تلقائيًا مع كل طلب محمي.
- **بحث متقدّم:** تصفية بالشركة ووقت الانطلاق، وترتيب بالسعر أو المدة أو وقت المغادرة.
- **مخطط مقاعد تفاعلي:** المقاعد المحجوزة تُقرأ من الخادم، واختيار محدود بعدد المسافرين.
- **حجز بثلاث خطوات:** المقاعد ← بيانات المسافرين ← المراجعة والتأكيد.
- **إدارة الحجوزات:** قائمة «حجوزاتي»، تفاصيل التذكرة، وإلغاء الحجز.
- **تتبّع الرحلة:** خريطة مسار SVG مع تقدّم ومحطات ووقت وصول تقديري.
- **واجهة عربية RTL** مع وضعين فاتح وداكن، تعمل على الجوال والحاسب.
- **معالجة أخطاء موحّدة:** رسائل عربية لأكواد الخادم، وإنهاء الجلسة تلقائيًا عند 401.

---

## التقنيات

| الطبقة | التقنية |
| --- | --- |
| البناء | Vite 6 |
| الواجهة | React 18 + TypeScript (strict) |
| التوجيه | React Router 6 |
| حالة الخادم | TanStack Query 5 |
| عميل الـ API | Fetch API + عميل مركزي مكتوب يدويًا |
| التنسيق | CSS مخصّص (نظام تصميم خاص) + أيقونات SVG مضمّنة |

---

## بنية المشروع

```
src/
├── api/
│   ├── client.ts        عميل Fetch المركزي: Base URL + JWT + أخطاء موحّدة
│   ├── endpoints.ts     دالة واحدة لكل نقطة نهاية
│   └── types.ts         أنواع الطلبات والردود (TypeScript)
├── components/
│   ├── layout/          Header, Footer, AppLayout, Logo
│   ├── ui/              Icon, Photo, States (تحميل/خطأ/فراغ)
│   ├── SearchForm.tsx   نموذج البحث المشترك
│   ├── TripCard.tsx     بطاقة الرحلة
│   └── RouteMap.tsx     خريطة المسار (SVG محلية)
├── hooks/               خطاف واحد لكل عملية + queryKeys + index.ts
├── lib/                 env, auth, theme, format, company
├── pages/               صفحات التطبيق (12 صفحة)
└── styles/              نظام التصميم + إضافات
docs/
└── api-contract.md      توثيق أشكال استجابات الـ API
```

طبقة البيانات بسيطة بثلاث درجات، بلا أي توليد آلي للكود:

```
React Components  →  React Query Hooks  →  API Endpoints  →  Central Client  →  Backend
```

---

## التشغيل محليًا

**المتطلبات:** Node.js 20 أو أحدث، و`pnpm` (أو `npm`).

```bash
# 1) استنساخ المستودع
git clone <repository-url>
cd sairna-react

# 2) تثبيت الاعتماديات
pnpm install

# 3) إعداد متغيرات البيئة
cp .env.example .env

# 4) تشغيل خادم التطوير
pnpm dev
```

ثم افتح: http://localhost:5173

> **ملاحظة:** خادم التطوير يمرّر طلبات `/api` إلى الخادم الحقيقي عبر بروكسي Vite (وفق `VITE_API_PROXY_TARGET`)، فلا حاجة لضبط CORS أثناء التطوير.

---

## متغيرات البيئة

| المتغير | الوصف | الافتراضي |
| --- | --- | --- |
| `VITE_API_BASE_URL` | بادئة عنوان الـ API. اتركه فارغًا للتطوير عبر البروكسي، وفي الإنتاج ضع عنوان الخادم الكامل | فارغ |
| `VITE_API_PROXY_TARGET` | وجهة بروكسي Vite لطلبات `/api` في التطوير | — |
| `VITE_AUTH_TOKEN_HEADER` | اسم الترويسة التي يحملها التوكن | `Authorization` |
| `VITE_AUTH_TOKEN_PREFIX` | بادئة قيمة التوكن | `Bearer ` |

---

## الأوامر

| الأمر | الوظيفة |
| --- | --- |
| `pnpm dev` | تشغيل خادم التطوير |
| `pnpm build` | فحص TypeScript ثم بناء الإنتاج إلى `dist/` |
| `pnpm typecheck` | فحص الأنواع فقط |
| `pnpm preview` | معاينة بناء الإنتاج عبر Vite |
| `pnpm serve` | معاينة `dist/` بخادم Node مع بروكسي `/api` |

---

## طبقة الـ API

كل الطلبات تمرّ عبر عميل واحد في [`src/api/client.ts`](src/api/client.ts):

```ts
request<T>({ path: '/api/v1/website/trips', query: { originId: 2, date: '2026-11-13' } })
```

العميل مسؤول عن: بناء العنوان من `VITE_API_BASE_URL` + المسار + معاملات الاستعلام، إضافة `Authorization: Bearer <token>` عند وجود جلسة، مسح الجلسة عند `401`، وتحويل أخطاء الخادم إلى `ApiError` برسائل عربية.

### إضافة نقطة نهاية جديدة

1. راجع توثيق الـ API (رابط Swagger أدناه) لمعرفة المسار والطريقة والمعاملات.
2. أضف/حدّث الأنواع في [`src/api/types.ts`](src/api/types.ts).
3. أضف الدالة في [`src/api/endpoints.ts`](src/api/endpoints.ts) باستخدام `request<T>()`.
4. أضف خطافًا في `src/hooks/` وسجّله في [`src/hooks/index.ts`](src/hooks/index.ts).

---

## مرجع الـ API

- **توثيق Swagger:** https://sairna.abdulrahman-hares.com/api/docs/website
- **أشكال الاستجابات:** [`docs/api-contract.md`](docs/api-contract.md)

### نقاط النهاية المستخدمة

| الطريقة | المسار | الوصف |
| --- | --- | --- |
| `POST` | `/api/v1/website/auth/register` | إنشاء حساب مسافر |
| `POST` | `/api/v1/website/auth/login` | تسجيل الدخول |
| `GET` | `/api/v1/website/auth/me` | الملف الشخصي |
| `GET` | `/api/v1/website/cities` | المحافظات |
| `GET` | `/api/v1/website/companies` | شركات النقل |
| `GET` | `/api/v1/website/companies/{id}` | شركة واحدة |
| `GET` | `/api/v1/website/trips` | البحث عن رحلات |
| `GET` | `/api/v1/website/trips/{id}` | تفاصيل رحلة |
| `GET` | `/api/v1/website/trips/{id}/seats` | مخطط المقاعد |
| `POST` | `/api/v1/website/bookings` | إنشاء حجز |
| `GET` | `/api/v1/website/bookings/me` | حجوزات المستخدم |
| `GET` | `/api/v1/website/bookings/{id}` | تفاصيل حجز |
| `POST` | `/api/v1/website/bookings/{id}/cancel` | إلغاء حجز |

الطلبات المحمية تتطلب ترويسة `Authorization: Bearer <token>`.

---

## الصفحات

| المسار | الصفحة |
| --- | --- |
| `/` | الرئيسية: هيرو، نموذج البحث، الوجهات، خطوات الحجز، معاينة المسار |
| `/results` | نتائج البحث مع التصفية والترتيب |
| `/companies` | شركات النقل |
| `/booking/:tripId` | إتمام الحجز (مقاعد ← مسافرون ← مراجعة) |
| `/trips` | حجوزاتي |
| `/tracking` · `/tracking/:bookingId` | تتبّع الرحلة |
| `/success/:bookingId` | تأكيد الحجز والتذكرة |
| `/login` · `/register` | المصادقة |
| `/account` | الملف الشخصي |
| `/about` · `/support` | عن سيرنا · مركز المساعدة |

---

## النشر

```bash
pnpm build    # ينتج مجلد dist/
```

- **SPA fallback مطلوب:** التوجيه يتم في المتصفح، لذا يجب توجيه كل المسارات إلى `index.html`:

  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```

- **الـ API:** الواجهة تنادي `/api/...` على نفس الأصل، لذا مرّر `/api` إلى خادم سيرنا من خادمك، أو اضبط `VITE_API_BASE_URL` على عنوان الخادم الكامل وقت البناء.

---

## ملاحظات وقيود

- توثيق Swagger يصف **أجسام الطلبات** فقط (RegisterDto, LoginDto, PassengerSeatDto, CreateBookingDto)، ولا يصف أجسام الردود؛ لذلك أنواع الردود مكتوبة يدويًا في `src/api/types.ts` اعتمادًا على الاستجابات الفعلية. عند تغيّر الـ API يُحدَّث الملف يدويًا.
- التتبّع على الخريطة **محاكاة تعليمية** وليس تتبّع GPS حقيقي.
- خيارات الدفع في صفحة المراجعة عرض واجهة فقط، والحجز يُسجَّل دون أي تحصيل مالي.
- بيانات الـ API تدريبية.
- لا توجد اختبارات آلية بعد؛ التحقق الحالي يدوي عبر `pnpm typecheck` و`pnpm build`.

---

## المساهمة

المساهمات مرحّب بها:

1. أنشئ فرعًا جديدًا: `git checkout -b feature/name`
2. نفّذ التعديلات وتأكد من نجاح `pnpm typecheck` و`pnpm build`
3. افتح Pull Request مع وصف واضح للتغيير

---

<p align="center"><sub>مشروع تدريبي — واجهة سيرنا</sub></p>
