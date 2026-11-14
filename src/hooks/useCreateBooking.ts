import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking } from "@/api/endpoints";
import type { CreateBookingInput } from "@/api/types";
import { queryKeys } from "./queryKeys";

/**
 * إنشاء حجز: `POST /api/v1/website/bookings`
 * بعد النجاح يُبطل كاش «حجوزاتي» حتى تظهر التذكرة الجديدة فورًا.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => createBooking(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
    },
  });
}
