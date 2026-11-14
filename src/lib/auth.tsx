import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/api/types";
import {
  clearSession,
  getStoredUser,
  getToken,
  setSession,
  subscribeAuth,
} from "./auth-storage";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (token: string, user: AuthUser) => void;
  signOut: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(subscribeAuth, getToken, () => null);
  const user = useSyncExternalStore(subscribeAuth, getStoredUser, () => null);

  const signIn = useCallback((nextToken: string, nextUser: AuthUser) => {
    setSession(nextToken, nextUser);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => {
    setSession(getToken(), nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
      updateUser,
    }),
    [user, token, signIn, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
