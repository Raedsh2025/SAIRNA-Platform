import { useQuery } from "@tanstack/react-query";
import { listTrips } from "@/api/endpoints";
import type { TripFilters } from "@/api/types";
import { queryKeys } from "./queryKeys";

/**
 * البحث عن الرحلات: `GET /api/v1/website/trips`
 * الفلاتر جزء من مفتاح الكاش، فكل تركيبة بحث لها كاش مستقل.
 *
 * @param options.enabled يمكن تعطيل الاستعلام حتى تتوفر شروط معيّنة
 *        (مثلًا: البحث البديل عندما لا توجد نتائج في التاريخ المحدد).
 */
export function useTrips(
  filters: TripFilters,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.trips(filters),
    queryFn: () => listTrips(filters),
    staleTime: 60 * 1000,
    enabled: options.enabled ?? true,
  });
}
