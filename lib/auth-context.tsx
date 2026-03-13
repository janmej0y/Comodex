"use client";

import { useMutation } from "@apollo/client";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { LOGIN_USER } from "@/lib/graphql";
import { LoginInput, Role, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isBootstrapping: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  canAccess: (roles?: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "commodex-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [mutateLogin] = useMutation(LOGIN_USER);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const serialized = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (serialized) {
      try {
        const parsed = JSON.parse(serialized) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    setIsBootstrapping(false);
  }, []);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (!token || !user) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      if (pathname !== "/") {
        router.replace("/");
      }
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
  }, [isBootstrapping, pathname, router, token, user]);

  const login = useCallback(
    async (input: LoginInput) => {
      const { data } = await mutateLogin({ variables: { input } });
      const nextUser = data?.login?.user as User;
      const nextToken = data?.login?.token as string;

      if (!nextUser || !nextToken) {
        throw new Error("Login failed.");
      }

      setUser(nextUser);
      setToken(nextToken);

      if (nextUser.role === Role.MANAGER) {
        router.replace("/dashboard");
      } else {
        router.replace("/products");
      }
    },
    [mutateLogin, router]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    router.replace("/");
  }, [router]);

  const canAccess = useCallback(
    (roles?: Role[]) => {
      if (!user) {
        return false;
      }

      if (!roles || roles.length === 0) {
        return true;
      }

      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, token, isBootstrapping, login, logout, canAccess }),
    [canAccess, isBootstrapping, login, logout, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}