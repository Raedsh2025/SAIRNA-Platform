/**
 * واجهة الخطافات الموحّدة.
 * كل عملية في ملف مستقل، وهذا الملف يجمعها للاستيراد المختصر:
 *
 *   import { useCities, useTrips } from '@/hooks'
 */
export { queryKeys } from "./queryKeys";

export { useCities } from "./useCities";
export { useCompanies } from "./useCompanies";

export { useTrips } from "./useTrips";
export { useTrip } from "./useTrip";
export { useSeatMap } from "./useSeatMap";

export { useMyBookings } from "./useMyBookings";
export { useBooking } from "./useBooking";
export { useCreateBooking } from "./useCreateBooking";
export { useCancelBooking } from "./useCancelBooking";

export { useLogin } from "./useLogin";
export { useRegister } from "./useRegister";
export { useMe } from "./useMe";
