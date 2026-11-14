import { env } from "@/lib/env";
import { clearSession, getToken } from "@/lib/auth-storage";

/**
 * عميل الـ API المركزي (Fetch).
 *
 * كل طلب في التطبيق يمر من هنا:
 * - يبني العنوان من `VITE_API_BASE_URL` + المسار + Query Parameters.
 * - يضيف ترويسة JWT تلقائيًا إن كانت هناك جلسة.
 * - يرمي `ApiError` موحّدًا برسالة عربية عند الفشل.
 * - يمسح الجلسة عند 401.
 *
 * أنواع الطلبات والردود مكتوبة يدويًا في `src/api/types.ts`
 * اعتمادًا على توثيق Swagger (المصدر الرسمي للعقد).
 */

/** Record هو Utility Type جاهز في TypeScript. يمثل تعيينًا من مفاتيح سلسلة إلى قيم سلسلة. */
const ERROR_MESSAGES: Record<string, string> = {
  TRIP_ALREADY_DEPARTED: "انطلقت هذه الرحلة بالفعل، اختار رحلة أخرى.",
  TRIP_NOT_FOUND: "الرحلة غير موجودة أو لم تعد متاحة.",
  TRIP_FULL: "اكتمل عدد مقاعد هذه الرحلة.",
  SEAT_ALREADY_BOOKED: "أحد المقاعد المختارة محجوز مسبقًا، اختار مقعدًا آخر.",
  SEATS_UNAVAILABLE:
    "بعض المقاعد المختارة لم تعد متاحة، حدّث المخطط وأعد الاختيار.",
  BOOKING_NOT_FOUND: "الحجز غير موجود.",
  BOOKING_ALREADY_CANCELLED: "تم إلغاء هذا الحجز مسبقًا.",
  EMAIL_ALREADY_EXISTS:
    "هذا البريد الإلكتروني مسجّل مسبقًا. جرّب تسجيل الدخول.",
  INVALID_CREDENTIALS: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  UNAUTHORIZED: "انتهت الجلسة أو أنت غير مسجّل الدخول. سجّل الدخول من جديد.",
  FORBIDDEN: "ليس لديك صلاحية لهذا الإجراء.",
  VALIDATION_ERROR: "تحقّق من البيانات المُدخلة وحاول مرة أخرى.",
};

/** خطأ موحّد لكل طلبات الـ API، يحمل الحالة والحمولة الأصلية. */
export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown, message?: string) {
    super(message ?? extractMessage(payload, status));
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  /** هل الخطأ بسبب الشبكة قبل وصول الطلب إلى الخادم؟ */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

function extractMessage(payload: unknown, status: number): string {
  if (typeof payload === "string" && payload.trim()) {
    return ERROR_MESSAGES[payload.trim()] ?? payload;
  }

  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;

    for (const key of ["detail", "message", "title", "error"]) {
      const value = body[key];
      if (typeof value === "string" && value.trim()) {
        return ERROR_MESSAGES[value.trim()] ?? value;
      }
    }

    // شكل ProblemDetails في NestJS: { message: [...], error: '...' }
    if (Array.isArray(body.message)) {
      const messages = body.message.filter(
        (item): item is string => typeof item === "string",
      );
      if (messages.length > 0) {
        return messages.map((item) => ERROR_MESSAGES[item] ?? item).join(" • ");
      }
    }

    const errors = body.errors;
    if (errors && typeof errors === "object") {
      const messages = Object.values(errors as Record<string, unknown>)
        .flat()
        .filter((item): item is string => typeof item === "string");
      if (messages.length > 0) return messages.join(" • ");
    }
  }

  if (status === 0) {
    return "تعذّر الاتصال بالخادم. تأكد من اتصالك بالإنترنت أو من تشغيل الـ API.";
  }
  return `فشل الطلب (HTTP ${status})`;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** قيم مسموحة في Query String — القيم الفارغة تُتجاهل. */
export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  /** المسار الكامل بعد الـ base، مثل: /api/v1/website/trips */
  path: string;
  method?: HttpMethod;
  query?: Record<string, QueryValue>;
  /** جسم الطلب — يُحوَّل إلى JSON تلقائيًا. */
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): URL {
  const url = new URL(`${env.apiBaseUrl}${path}`, window.location.origin);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url;
}

/** يقرأ جسم الرد بأمان: JSON عند الإمكان، نص خام، أو undefined لـ 204. */
async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text.trim()) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * ينفّذ طلبًا واحدًا ويعيد الجسم مُحوَّلًا إلى النوع المطلوب.
 * يرمي `ApiError` عند أي فشل (شبكة أو حالة HTTP غير ناجحة).
 */
export async function request<T>({
  path,
  method = "GET",
  query,
  body,
  signal,
}: RequestOptions): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set(env.authHeader, `${env.authTokenPrefix}${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    // إلغاء الطلب (React Query) ليس خطأ شبكة — نمرّره كما هو.
    if (cause instanceof DOMException && cause.name === "AbortError")
      throw cause;
    throw new ApiError(0, cause);
  }

  const payload = await readBody(response);

  if (response.status === 401) {
    clearSession();
  }

  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }

  return payload as T;
}
