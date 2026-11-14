/**
 * أنواع استجابات API سيرنا.
 *
 * سبب وجود هذا الملف: مواصفة Swagger الخاصة بالخادم تصف أجسام الطلبات
 * (RegisterDto / LoginDto / CreateBookingDto) لكنها لا تصف أجسام الاستجابات.
 * لذلك تُولَّد أنواع الطلبات آليًا من المواصفة، وتُكتب أنواع الاستجابات هنا
 * يدويًا اعتمادًا على استجابات الخادم الفعلية (موثّقة في docs/api-contract.md).
 */

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Company {
  id: number;
  name: string;
  logoUrl: string | null;
  isActive?: boolean;
}

export type TripStatus =
  | "AVAILABLE"
  | "FULL"
  | "CANCELLED"
  | "DEPARTED"
  | string;

export interface Trip {
  id: number;
  code: string;
  companyId: number;
  originId: number;
  destinationId: number;
  /** ISO 8601 UTC */
  departureAt: string;
  /** ISO 8601 UTC */
  arrivalAt: string;
  price: number;
  totalSeats: number;
  status: TripStatus;
  company: Company;
  origin: City;
  destination: City;
  _count?: { bookingSeats?: number };
  availableSeats: number;
}

export interface SeatMap {
  tripId: number;
  totalSeats: number;
  status: TripStatus;
  occupiedSeats: number[];
  availableSeats: number;
}

export interface PassengerSeat {
  seatNumber: number;
  passengerName: string;
  passengerPhone: string;
}

export interface BookingSeat {
  seatNumber: number;
  passengerName?: string;
  passengerPhone?: string;
}

export interface Booking {
  id: number | string;
  code?: string;
  status?: string;
  tripId?: number;
  totalPrice?: number;
  createdAt?: string;
  seats?: BookingSeat[];
  /** يعيده الخادم غالبًا ككائن رحلة كاملًا أو مختصرًا. */
  trip?: Trip | null;
  [key: string]: unknown;
}

export interface TripFilters {
  originId?: number;
  destinationId?: number;
  companyId?: number;
  /** YYYY-MM-DD */
  date?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

/** جسم طلب تسجيل الدخول — يقابل `LoginDto` في Swagger. */
export interface LoginBody {
  email: string;
  password: string;
}

/** جسم طلب إنشاء الحساب — يقابل `RegisterDto` في Swagger (كلمة المرور 8 أحرف على الأقل). */
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id?: number | string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface CreateBookingInput {
  tripId: number;
  seats: PassengerSeat[];
}
