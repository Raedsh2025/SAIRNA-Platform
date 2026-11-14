import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register, type RegisterBody } from "@/api/endpoints";

/**
 * إنشاء حساب: `POST /api/v1/website/auth/register`
 * لا يحفظ الجلسة بنفسه — الصفحة تستدعي `signIn` من `useAuth` بعد النجاح.
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RegisterBody) => register(body),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}
