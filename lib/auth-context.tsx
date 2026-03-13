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
import { LOGIN_USER, LOGOUT_USER, REFRESH_SESSION, SIGNUP_USER } from "@/lib/graphql";
import { LoginInput, Role, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isBootstrapping: boolean;
  signup: (input: { name: string; email: string; password: string; role: Role }) => Promise<User>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  canAccess: (roles?: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "commodex-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [mutateSignup] = useMutation(SIGNUP_USER);
  const [mutateLogin] = useMutation(LOGIN_USER);
  const [mutateRefresh] = useMutation(REFRESH_SESSION);
  const [mutateLogout] = useMutation(LOGOUT_USER);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      const serialized = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!serialized) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const parsed = JSON.parse(serialized) as { user: User; token: string; refreshToken?: string };
        setUser(parsed.user);
        setToken(parsed.token);
        setRefreshToken(parsed.refreshToken ?? null);

        if (!parsed.token && parsed.refreshToken) {
          const { data } = await mutateRefresh({ variables: { input: { refreshToken: parsed.refreshToken } } });
          const next = data?.refreshSession;
          if (next?.token && next?.user) {
            setUser(next.user);
            setToken(next.token);
            setRefreshToken(next.refreshToken);
          }
        }
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [mutateRefresh]);

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

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token, refreshToken }));
  }, [isBootstrapping, pathname, refreshToken, router, token, user]);

  const login = useCallback(
    async (input: LoginInput) => {
      const { data } = await mutateLogin({ variables: { input } });
      const nextUser = data?.login?.user as User;
      const nextToken = data?.login?.token as string;
      const nextRefreshToken = data?.login?.refreshToken as string;

      if (!nextUser || !nextToken || !nextRefreshToken) {
        throw new Error("Login failed.");
      }

      setUser(nextUser);
      setToken(nextToken);
      setRefreshToken(nextRefreshToken);

      if (nextUser.role === Role.MANAGER) {
        router.replace("/dashboard");
      } else {
        router.replace("/products");
      }
    },
    [mutateLogin, router]
  );

  const signup = useCallback(
    async (input: { name: string; email: string; password: string; role: Role }) => {
      const { data } = await mutateSignup({ variables: { input } });
      const nextUser = data?.signup as User;

      if (!nextUser) {
        throw new Error("Signup failed.");
      }

      return nextUser;
    },
    [mutateSignup]
  );

  const logout = useCallback(async () => {
    const currentRefreshToken = refreshToken;

    setUser(null);
    setToken(null);
    setRefreshToken(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);

    if (currentRefreshToken) {
      try {
        await mutateLogout({ variables: { refreshToken: currentRefreshToken } });
      } catch {
        // Session is already cleared locally.
      }
    }

    router.replace("/");
  }, [mutateLogout, refreshToken, router]);

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
    () => ({ user, token, refreshToken, isBootstrapping, signup, login, logout, canAccess }),
    [canAccess, isBootstrapping, login, logout, refreshToken, signup, token, user]
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

