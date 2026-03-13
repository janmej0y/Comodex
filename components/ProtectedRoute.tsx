"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Role } from "@/types/auth";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  roles?: Role[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { user, isBootstrapping, canAccess } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (!user) {
      router.replace("/");
      return;
    }

    if (!canAccess(roles)) {
      router.replace("/products");
      return;
    }
  }, [canAccess, isBootstrapping, roles, router, user]);

  if (isBootstrapping || !user || !canAccess(roles)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900/85">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Checking access</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{pathname}</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
