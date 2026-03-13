"use client";

import { motion } from "framer-motion";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, ShieldCheck, UserCog, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ErrorAlert from "@/components/ErrorAlert";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth-context";
import { normalizeError, reportError } from "@/lib/error-utils";
import { trackEvent } from "@/lib/telemetry";
import { useTheme } from "@/lib/theme-context";
import { Role } from "@/types/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("manager@comodex.io");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<Role>(Role.MANAGER);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, login, signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("last-login-role") as Role | null;
    const savedEmail = localStorage.getItem("last-login-email");
    if (saved) {
      setRole(saved);
    }
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    router.replace(user.role === Role.MANAGER ? "/dashboard" : "/products");
  }, [router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      setError("Use a valid email address.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        if (name.trim().length < 2) {
          setError("Name must be at least 2 characters.");
          setLoading(false);
          return;
        }

        await signup({ name: name.trim(), email: normalizedEmail, password: password.trim(), role });
        setMode("signin");
        setError(null);
        setNotice("Account created. Sign in with your new credentials.");
        setPassword("");
        localStorage.setItem("last-login-role", role);
        localStorage.setItem("last-login-email", normalizedEmail);
        trackEvent("auth_signup_success", { role });
        return;
      }

      await login({ email: normalizedEmail, password: password.trim(), role });
      trackEvent("auth_login_success", { role });
      localStorage.setItem("last-login-role", role);
      localStorage.setItem("last-login-email", normalizedEmail);
    } catch (submitError) {
      const normalized = normalizeError(
        submitError,
        mode === "signup" ? "auth_signup" : "auth_login",
        mode === "signup" ? "Signup failed. Please verify and retry." : "Authentication failed. Please verify and retry."
      );
      setError(normalized.userMessage);
      setErrorId(normalized.id);
      reportError(submitError, mode === "signup" ? "auth_signup" : "auth_login", { role, email });
      trackEvent(mode === "signup" ? "auth_signup_error" : "auth_login_error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/20" />
      <div className="pointer-events-none absolute -bottom-20 -right-12 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/20" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md rounded-[1.8rem] border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur-xl sm:rounded-3xl sm:p-8 dark:border-slate-800 dark:bg-slate-900/75"
      >
        <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8">
          <div className="min-w-0">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Access
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">Comodex Login</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Role-aware access for commodities operations.</p>
          </div>
          <Button
            variant="secondary"
            onClick={toggleTheme}
            className="shrink-0 px-3 py-2 text-xs"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-950/60">
            <Button type="button" variant={mode === "signin" ? "primary" : "ghost"} onClick={() => setMode("signin")}>
              Sign In
            </Button>
            <Button type="button" variant={mode === "signup" ? "primary" : "ghost"} onClick={() => setMode("signup")}>
              Sign Up
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              className="justify-start"
              onClick={() => {
                setMode("signin");
                setRole(Role.MANAGER);
                setEmail("manager@comodex.io");
                setPassword("password123");
                setNotice("Demo manager account is for sign-in. Use a different email if you want to sign up.");
              }}
            >
              <UserCog className="h-4 w-4" />
              Use Manager Demo
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="justify-start"
              onClick={() => {
                setMode("signin");
                setRole(Role.STORE_KEEPER);
                setEmail("storekeeper@comodex.io");
                setPassword("password123");
                setNotice("Demo store keeper account is for sign-in. Use a different email if you want to sign up.");
              }}
            >
              <Warehouse className="h-4 w-4" />
              Use Store Keeper Demo
            </Button>
          </div>

          {mode === "signup" ? (
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</span>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          ) : null}

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</span>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</span>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</span>
            <Select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              <option value={Role.MANAGER}>Manager</option>
              <option value={Role.STORE_KEEPER}>Store Keeper</option>
            </Select>
          </label>

          {notice ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{notice}</p> : null}
          {error ? <ErrorAlert title={mode === "signup" ? "Signup failed" : "Sign-in failed"} message={error} errorId={errorId ?? undefined} /> : null}

          <Button loading={loading} className="flex w-full items-center justify-center gap-2">
            <Box className="h-4 w-4" />
            {mode === "signup" ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:mt-5">
          {mode === "signup"
            ? "Create a manager or store keeper account first, then sign in."
            : "Tip: press Enter to sign in quickly. Demo password: `password123`."}
        </p>
      </motion.div>
    </div>
  );
}
