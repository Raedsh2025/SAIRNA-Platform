import { useQuery } from "@tanstack/react-query";
import { getBooking } from "@/api/endpoints";
import { useAuth } from "@/lib/auth";
import { queryKeys } from "./queryKeys";

/**
 * تفاصيل حجز واحد: `GET /api/v1/website/bookings/{id}`
 * يتطلب جلسة، ويُعطَّل تلقائيًا بدون معرّف.
 */
export function useBooking(id: number | string | null) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.booking(id ?? ""),
    queryFn: () => getBooking(id as number | string),
    enabled: isAuthenticated && id !== null && id !== "",
    staleTime: 30 * 1000,
    retry: false,
  });
}
