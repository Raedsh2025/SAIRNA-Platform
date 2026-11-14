import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelBooking } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

/**
 * إلغاء حجز: `POST /api/v1/website/bookings/{id}/cancel`
 * بعد النجاح يُحدَّث كاش «حجوزاتي» لتظهر حالة «ملغى».
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => cancelBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
    },
  });
}
