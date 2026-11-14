import { useQuery } from "@tanstack/react-query";
import { listCities } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

/**
 * المحافظات: `GET /api/v1/website/cities`
 * بيانات مرجعية لا تتغير كثيرًا — تُخزَّن 10 دقائق.
 */
export function useCities() {
  return useQuery({
    queryKey: queryKeys.cities,
    queryFn: listCities,
    staleTime: 10 * 60 * 1000,
  });
}
