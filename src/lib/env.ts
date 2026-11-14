/** قيم الإعدادات المقروءة من متغيرات البيئة (.env). */
export const env = {
  /**
   * بادئة عنوان الـ API.
   * فارغة افتراضيًا لأن المسارات تبدأ بـ /api/v1/website،
   * وطلباتها تمر عبر بروكسي Vite أثناء التطوير.
   */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? "").trim(),
  apiProxyTarget: (import.meta.env.VITE_API_PROXY_TARGET ?? "").trim(),
  authHeader: (
    import.meta.env.VITE_AUTH_TOKEN_HEADER ?? "Authorization"
  ).trim(),
  authTokenPrefix: import.meta.env.VITE_AUTH_TOKEN_PREFIX ?? "Bearer ",
  isDev: import.meta.env.DEV,
} as const;
