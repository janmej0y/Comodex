"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
        Checking access for {pathname}...
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
