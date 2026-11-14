import { useQuery } from "@tanstack/react-query";
import { listMyBookings } from "@/api/endpoints";
import { useAuth } from "@/lib/auth";
import { queryKeys } from "./queryKeys";

/**
 * حجوزات المستخدم الحالي: `GET /api/v1/website/bookings/me`
 * يتطلب تسجيل الدخول — لا يُنفَّذ الطلب بدون جلسة.
 */
export function useMyBookings() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.myBookings,
    queryFn: listMyBookings,
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    retry: false,
  });
}
