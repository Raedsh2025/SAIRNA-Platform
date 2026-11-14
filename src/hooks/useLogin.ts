import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, type LoginBody } from "@/api/endpoints";

/**
 * تسجيل الدخول: `POST /api/v1/website/auth/login`
 * لا يحفظ الجلسة بنفسه — الصفحة تستدعي `signIn` من `useAuth` بعد النجاح.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginBody) => login(body),
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}
