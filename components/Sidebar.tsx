"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Moon, Sun } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { NAV_ITEMS } from "@/lib/navigation";
import { isManager } from "@/lib/access-control";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const filteredMenu = useMemo(
    () => NAV_ITEMS.filter((item) => (user ? item.roles.includes(user.role) : false)),
    [user]
  );

  return (
    <aside className="relative hidden h-screen w-80 flex-col border-r border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.82))] p-5 shadow-[0_28px_60px_-45px_rgba(15,23,42,0.5)] backdrop-blur-2xl dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.86),rgba(15,23,42,0.76))] xl:flex">
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Comodex</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Executive Operations Cloud</p>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <motion.div key={item.href} whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
                <Link
                  href={item.href}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-brand-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </nav>

        <div className="mt-4 space-y-3 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/70">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user?.email}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role?.replace("_", " ")}</p>
          {!isManager(user?.role) ? (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-300">Dashboard and manager modules are restricted.</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button onClick={toggleTheme} variant="secondary" className="flex-1 px-3 py-2 text-xs">
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
          <Button onClick={logout} variant="danger" className="flex-1 px-3 py-2 text-xs">
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
