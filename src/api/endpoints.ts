import { ApiError, request } from "./client";
import type {
  AuthSession,
  AuthUser,
  Booking,
  City,
  Company,
  CreateBookingInput,
  LoginBody,
  RegisterBody,
  SeatMap,
  Trip,
  TripFilters,
} from "./types";

/**
 * دوال الـ API: كل دالة تُغلف نقطة نهاية واحدة وتعيد النوع الصحيح.
 * هي الطبقة الوحيدة التي تعرف المسارات وطرق الإرسال؛ الصفحات والخطافات
 * لا تستدعي `fetch` مباشرة.
 *
 * المسارات وأجسام الطلبات مأخوذة حرفيًا من توثيق Swagger،
 * والردود موثّقة في `docs/api-contract.md`.
 */

export type { LoginBody, RegisterBody };

/* ------------------------------------------------------------------ */
/* أدوات تطبيع الاستجابات                                              */
/* ------------------------------------------------------------------ */

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** يبحث عن أول قيمة نصية غير فارغة ضمن مفاتيح معروفة (بعمق محدود). */
function findString(
  value: unknown,
  keys: string[],
  depth = 0,
): string | undefined {
  if (depth > 3) return undefined;

  const record = asRecord(value);
  if (!record) return undefined;

  for (const key of keys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }

  for (const nested of Object.values(record)) {
    const found = findString(nested, keys, depth + 1);
    if (found) return found;
  }

  return undefined;
}

function extractUser(payload: unknown): AuthUser | null {
  const record = asRecord(payload);
  if (!record) return null;

  const candidates = [
    record.user,
    record.passenger,
    record.profile,
    record.data,
    record.result,
  ];
  for (const candidate of candidates) {
    const user = asRecord(candidate);
    if (!user) continue;
    const name = typeof user.name === "string" ? user.name : undefined;
    const email = typeof user.email === "string" ? user.email : undefined;
    if (name || email) {
      return {
        id: (user.id as number | string | undefined) ?? undefined,
        name: name ?? email ?? "مسافر",
        email: email ?? "",
        phone: typeof user.phone === "string" ? user.phone : undefined,
        role: typeof user.role === "string" ? user.role : undefined,
      };
    }
  }

  // استجابة /auth/me مسطّحة: { id, name, email, role, createdAt }
  const name = findString(record, ["name", "fullName"]);
  const email = findString(record, ["email"]);
  if (name || email) {
    return {
      id: (record.id as number | string | undefined) ?? undefined,
      name: name ?? email ?? "مسافر",
      email: email ?? "",
      phone: typeof record.phone === "string" ? record.phone : undefined,
      role: typeof record.role === "string" ? record.role : undefined,
    };
  }

  return null;
}

/** يطبّع استجابة تسجيل الدخول/التسجيل لأي شكل شائع من الخادم. */
export function normalizeAuthPayload(payload: unknown): {
  token: string;
  user: AuthUser | null;
} {
  const token = findString(payload, [
    "accessToken",
    "access_token",
    "token",
    "jwt",
  ]);

  if (!token) {
    throw new ApiError(
      500,
      payload,
      "تم الطلب بنجاح لكن تعذّر العثور على رمز الوصول في الاستجابة. راجع شكل استجابة /auth/login.",
    );
  }

  return { token, user: extractUser(payload) };
}

function toBooking(raw: unknown): Booking {
  const record = asRecord(raw);
  if (!record) {
    throw new ApiError(500, raw, "استجابة الحجز غير معروفة الشكل.");
  }

  const nested = asRecord(record.booking) ?? asRecord(record.data) ?? record;
  const id = nested.id ?? nested.bookingId ?? "";

  const seats = Array.isArray(nested.seats)
    ? (nested.seats as Booking["seats"])
    : Array.isArray(nested.passengers)
      ? (nested.passengers as Booking["seats"])
      : undefined;

  return {
    ...nested,
    id: id as number | string,
    code: typeof nested.code === "string" ? nested.code : undefined,
    status: typeof nested.status === "string" ? nested.status : undefined,
    tripId: typeof nested.tripId === "number" ? nested.tripId : undefined,
    totalPrice:
      typeof nested.totalPrice === "number"
        ? nested.totalPrice
        : typeof nested.total === "number"
          ? nested.total
          : undefined,
    createdAt:
      typeof nested.createdAt === "string" ? nested.createdAt : undefined,
    seats,
    trip: (nested.trip as Trip | null | undefined) ?? null,
  };
}

function toBookingList(raw: unknown): Booking[] {
  if (Array.isArray(raw)) return raw.map(toBooking);

  const record = asRecord(raw);
  if (!record) return [];

  const candidates = [
    record.items,
    record.bookings,
    record.data,
    record.results,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.map(toBooking);
  }

  return [];
}

/* ------------------------------------------------------------------ */
/* المدن                                                              */
/* ------------------------------------------------------------------ */

/** GET /api/v1/website/cities */
export function listCities(): Promise<City[]> {
  return request<City[]>({ path: "/api/v1/website/cities" });
}

/* ------------------------------------------------------------------ */
/* شركات النقل                                                        */
/* ------------------------------------------------------------------ */

/** GET /api/v1/website/companies */
export function listCompanies(): Promise<Company[]> {
  return request<Company[]>({ path: "/api/v1/website/companies" });
}

/** GET /api/v1/website/companies/{id} */
export function getCompany(id: number): Promise<Company> {
  return request<Company>({ path: `/api/v1/website/companies/${id}` });
}

/* ------------------------------------------------------------------ */
/* الرحلات                                                            */
/* ------------------------------------------------------------------ */

/** GET /api/v1/website/trips?originId&destinationId&companyId&date */
export function listTrips(filters: TripFilters = {}): Promise<Trip[]> {
  return request<Trip[]>({
    path: "/api/v1/website/trips",
    query: {
      originId: filters.originId,
      destinationId: filters.destinationId,
      companyId: filters.companyId,
      date: filters.date,
    },
  });
}

/** GET /api/v1/website/trips/{id} */
export function getTrip(id: number): Promise<Trip> {
  return request<Trip>({ path: `/api/v1/website/trips/${id}` });
}

/** GET /api/v1/website/trips/{id}/seats */
export function getSeatMap(id: number): Promise<SeatMap> {
  return request<SeatMap>({ path: `/api/v1/website/trips/${id}/seats` });
}

/* ------------------------------------------------------------------ */
/* الحجوزات                                                           */
/* ------------------------------------------------------------------ */

/** POST /api/v1/website/bookings (يتطلب توكن) */
export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return request<unknown>({
    path: "/api/v1/website/bookings",
    method: "POST",
    body: {
      tripId: input.tripId,
      seats: input.seats.map((seat) => ({
        seatNumber: seat.seatNumber,
        passengerName: seat.passengerName,
        passengerPhone: seat.passengerPhone,
      })),
    },
  }).then(toBooking);
}

/** GET /api/v1/website/bookings/me (يتطلب توكن) */
export function listMyBookings(): Promise<Booking[]> {
  return request<unknown>({ path: "/api/v1/website/bookings/me" }).then(
    toBookingList,
  );
}

/** معرّفات الحجوزات أرقام في الـ API؛ نحوّلها قبل بناء المسار. */
function numericId(id: number | string): number {
  return typeof id === "number" ? id : Number(id);
}

/** GET /api/v1/website/bookings/{id} (يتطلب توكن) */
export function getBooking(id: number | string): Promise<Booking> {
  return request<unknown>({
    path: `/api/v1/website/bookings/${numericId(id)}`,
  }).then(toBooking);
}

/** POST /api/v1/website/bookings/{id}/cancel (يتطلب توكن) */
export function cancelBooking(id: number | string): Promise<Booking> {
  return request<unknown>({
    path: `/api/v1/website/bookings/${numericId(id)}/cancel`,
    method: "POST",
  }).then(toBooking);
}

/* ------------------------------------------------------------------ */
/* المصادقة                                                           */
/* ------------------------------------------------------------------ */

/** POST /api/v1/website/auth/login */
export async function login(body: LoginBody): Promise<AuthSession> {
  const payload = await request<unknown>({
    path: "/api/v1/website/auth/login",
    method: "POST",
    body,
  });

  const normalized = normalizeAuthPayload(payload);

  if (normalized.user) {
    return { token: normalized.token, user: normalized.user };
  }

  // بعض الخوادم تعيد الرمز فقط؛ نكمل الملف الشخصي عبر useMe.
  return { token: normalized.token, user: { name: "", email: body.email } };
}

/** POST /api/v1/website/auth/register */
export async function register(body: RegisterBody): Promise<AuthSession> {
  const payload = await request<unknown>({
    path: "/api/v1/website/auth/register",
    method: "POST",
    body,
  });

  const normalized = normalizeAuthPayload(payload);

  return {
    token: normalized.token,
    user: normalized.user ?? { name: body.name, email: body.email },
  };
}

/** GET /api/v1/website/auth/me (يتطلب توكن) */
export async function fetchMe(): Promise<AuthUser> {
  const payload = await request<unknown>({ path: "/api/v1/website/auth/me" });
  const user = extractUser(payload);

  if (!user) {
    throw new ApiError(500, payload, "تعذّر قراءة بيانات الحساب من /auth/me.");
  }
  return user;
}
