import { useQuery } from '@tanstack/react-query'
import { getSeatMap } from '@/api/endpoints'
import { queryKeys } from './queryKeys'

/**
 * مخطط مقاعد الرحلة: `GET /api/v1/website/trips/{id}/seats`
 * مدة صلاحية قصيرة (15 ثانية) لأن المقاعد تُحجز من مستخدمين آخرين.
 */
export function useSeatMap(id: number | null) {
  return useQuery({
    queryKey: queryKeys.seatMap(id ?? 0),
    queryFn: () => getSeatMap(id as number),
    enabled: typeof id === 'number' && Number.isFinite(id),
    staleTime: 15 * 1000,
  })
}
