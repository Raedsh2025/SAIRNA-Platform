import type { TripFilters } from "@/api/types";

/**
 * مفاتيح الاستعلامات (Query Keys) في مكان واحد:
 * تُستخدم للقراءة من الكاش ولإبطاله بعد كل عملية كتابة.
 */
export const queryKeys = {
  cities: ["cities"] as const,
  companies: ["companies"] as const,
  trips: (filters: TripFilters) => ["trips", filters] as const,
  trip: (id: number) => ["trip", id] as const,
  seatMap: (id: number) => ["seat-map", id] as const,
  myBookings: ["bookings", "me"] as const,
  booking: (id: number | string) => ["booking", id] as const,
  me: ["auth", "me"] as const,
};
