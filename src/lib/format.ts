/** تنسيقات العرض العربية المشتركة (عملة، تاريخ، وقت، مدة). */

const DAMASCUS_TZ = "Asia/Damascus";

const currency = new Intl.NumberFormat("en-US");

/** 145000 ← "145,000 ل.س" */
export function money(amount: number | null | undefined): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—";
  return `${currency.format(amount)} ل.س`;
}

/** ISO ← "الخميس، 5 تشرين الثاني 2026" */
export function dateText(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-SY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: DAMASCUS_TZ,
  }).format(date);
}

/** ISO ← "07:00" بتوقيت دمشق */
export function timeText(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DAMASCUS_TZ,
  }).format(date);
}

/** ISO ← "2026-11-05" بتوقيت دمشق */
export function isoDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: DAMASCUS_TZ,
  }).format(date);
}

/** ISO ← "2026-11-05" للحقل <input type="date"> */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: DAMASCUS_TZ,
  }).format(new Date());
}

export function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: DAMASCUS_TZ,
  }).format(date);
}

/** فارق الدقائق بين وقتين ISO. */
export function durationMinutes(
  departureAt: string,
  arrivalAt: string,
): number {
  const start = new Date(departureAt).getTime();
  const end = new Date(arrivalAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 60000));
}

/** 375 ← "6 س 15 د" */
export function durationText(minutes: number): string {
  if (!minutes) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} د`;
  if (!rest) return `${hours} س`;
  return `${hours} س ${rest} د`;
}

/** ساعة الانطلاق بتوقيت دمشق: 0-23 */
export function departureHour(iso: string): number {
  const text = timeText(iso);
  return Number.parseInt(text.slice(0, 2), 10) || 0;
}

/** مسافة تقريبية بالكيلومترات بين إحداثيتين. */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export function bookingCode(booking: {
  code?: string;
  id: number | string;
}): string {
  return booking.code ?? String(booking.id);
}
