import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/api/endpoints";
import { useAuth } from "@/lib/auth";
import { queryKeys } from "./queryKeys";

/**
 * الملف الشخصي: `GET /api/v1/website/auth/me`
 * يُستخدم لاستكمال بيانات الحساب بعد تسجيل الدخول (الدور، الهاتف…).
 */
export function useMe() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: fetchMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
