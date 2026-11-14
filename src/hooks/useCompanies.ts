import { useQuery } from "@tanstack/react-query";
import { listCompanies } from "@/api/endpoints";
import { queryKeys } from "./queryKeys";

/**
 * شركات النقل: `GET /api/v1/website/companies`
 * بيانات مرجعية — تُخزَّن 10 دقائق.
 */
export function useCompanies() {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: listCompanies,
    staleTime: 10 * 60 * 1000,
  });
}
