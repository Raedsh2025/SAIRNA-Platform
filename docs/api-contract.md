# عقد الـ API الفعلي (SAIRNA Training API v2.0)

هذا الملف يوثّق أشكال الاستجابات الحقيقية التي يعتمد عليها التطبيق، لأن مواصفة
Swagger على الخادم تصف أجسام الطلبات فقط ولا تصف الاستجابات.

المصدر: استجابات حقيقية من `https://sairna.abdulrahman-hares.com/api/v1/website`.

## المدن — `GET /cities`

```json
[{ "id": 1, "name": "دمشق", "latitude": 33.5138, "longitude": 36.2765 }]
```

## الشركات — `GET /companies`

```json
[{ "id": 1, "name": "الشام للنقل (تجريبي)", "logoUrl": null, "isActive": true }]
```

## الرحلات — `GET /trips?originId&destinationId&companyId&date`

```json
[
  {
    "id": 73,
    "code": "DEMO-2026-11-13-1",
    "companyId": 1,
    "originId": 2,
    "destinationId": 1,
    "departureAt": "2026-11-13T07:00:00.000Z",
    "arrivalAt": "2026-11-13T13:00:00.000Z",
    "price": 145000,
    "totalSeats": 40,
    "status": "AVAILABLE",
    "company": { "id": 1, "name": "الشام للنقل (تجريبي)", "logoUrl": null },
    "origin": {
      "id": 2,
      "name": "حلب",
      "latitude": 36.2021,
      "longitude": 37.1343
    },
    "destination": {
      "id": 1,
      "name": "دمشق",
      "latitude": 33.5138,
      "longitude": 36.2765
    },
    "_count": { "bookingSeats": 1 },
    "availableSeats": 39
  }
]
```

- الأوقات UTC؛ تُعرض في الواجهة بتوقيت `Asia/Damascus`.
- `date` بصيغة `YYYY-MM-DD`. إذا لم توجد رحلات في التاريخ يعرض التطبيق كل الرحلات
  المتاحة مع تنبيه (بيانات الخادم التدريبية تغطي تواريخ محددة).

## مخطط المقاعد — `GET /trips/{id}/seats`

```json
{
  "tripId": 73,
  "totalSeats": 40,
  "status": "AVAILABLE",
  "occupiedSeats": [31],
  "availableSeats": 39
}
```

## إنشاء حجز — `POST /bookings` (يتطلب Bearer Token)

الطلب:

```json
{
  "tripId": 73,
  "seats": [
    {
      "seatNumber": 1,
      "passengerName": "مستخدم اختبار",
      "passengerPhone": "0912345678"
    }
  ]
}
```

الاستجابة `201`:

```json
{
  "id": 14,
  "code": "SR-53DB24A8",
  "userId": 60,
  "tripId": 73,
  "status": "CONFIRMED",
  "totalPrice": 290000,
  "createdAt": "2026-11-12T19:04:33.053Z",
  "cancelledAt": null,
  "trip": { "...": "كائن الرحلة كاملًا" },
  "seats": [
    {
      "id": 18,
      "bookingId": 14,
      "tripId": 73,
      "seatNumber": 1,
      "passengerName": "...",
      "passengerPhone": "..."
    }
  ]
}
```

## حجوزاتي — `GET /bookings/me`

مصفوفة بنفس شكل الحجز أعلاه. الحجوزات الملغاة تظهر بـ `status: "CANCELLED"` وبـ `seats: []`.

## إلغاء — `POST /bookings/{id}/cancel`

```json
{ "id": 14, "status": "CANCELLED" }
```

## المصادقة

`POST /auth/register` و `POST /auth/login` يعيدان:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "portal": "website",
  "user": { "id": 60, "name": "...", "email": "...", "role": "USER" }
}
```

`GET /auth/me` يعيد كائن المستخدم مسطّحًا:

```json
{ "id": 60, "name": "...", "email": "...", "role": "USER", "createdAt": "..." }
```

## أكواد الأخطاء المرصودة

| الكود                   | المعنى           | الرسالة المعروضة                           |
| ----------------------- | ---------------- | ------------------------------------------ |
| `TRIP_ALREADY_DEPARTED` | الرحلة انطلقت    | انطلقت هذه الرحلة بالفعل، اختار رحلة أخرى. |
| `SEAT_ALREADY_BOOKED`   | مقعد محجوز       | أحد المقاعد المختارة محجوز مسبقًا…         |
| `UNAUTHORIZED`          | توكن مفقود/منتهٍ | انتهت الجلسة أو أنت غير مسجّل الدخول…      |

شكل الخطأ: `{ "message": "CODE", "error": "Bad Request", "statusCode": 400 }`.
