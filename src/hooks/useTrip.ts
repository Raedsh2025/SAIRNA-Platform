import { useQuery } from "@tanstack/react-query";
import { getTrip } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

/**
 * رحلة واحدة: `GET /api/v1/website/trips/{id}`
 * يُعطَّل الاستعلام تلقائيًا إذا لم يكن المعرّف رقمًا صالحًا.
 */
export function useTrip(id: number | null) {
  return useQuery({
    queryKey: queryKeys.trip(id ?? 0),
    queryFn: () => getTrip(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
    staleTime: 60 * 1000,
  });
}
