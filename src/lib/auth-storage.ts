/**
 * تخزين جلسة المستخدم في المتصفح (بدون أي اعتماد على React).
 * فصلناه عن سياق React حتى يستطيع عميل الـ API قراءة التوكن مباشرة.
 */

import type { AuthUser } from "@/api/types";

const TOKEN_KEY = "sairna.auth.token";
const USER_KEY = "sairna.auth.user";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * كاش للقراءة: useSyncExternalStore يقارن اللقطة بـ Object.is،
 * لذا يجب أن يعيد نفس المرجع ما دام المحتوى المخزّن لم يتغيّر،
 * وإلا دخل المكوّن في حلقة تحديث لا نهائية.
 */
let userCache: { raw: string | null; user: AuthUser | null } | null = null;

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);

    if (userCache && userCache.raw === raw) {
      return userCache.user;
    }

    let user: AuthUser | null = null;
    if (raw) {
      const parsed = JSON.parse(raw) as AuthUser;
      user = typeof parsed?.name === "string" ? parsed : null;
    }

    userCache = { raw, user };
    return user;
  } catch {
    return null;
  }
}

export function setSession(token: string | null, user: AuthUser | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // التخزين غير متاح (تصفح خاص) — نتجاهل بهدوء.
  }

  // إبطال الكاش لأن المحتوى تغيّر.
  userCache = null;
  notify();
}

export function clearSession(): void {
  setSession(null, null);
}
