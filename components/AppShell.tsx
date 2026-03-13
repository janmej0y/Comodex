"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import BackToTop from "@/components/BackToTop";
import Sidebar from "@/components/Sidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import GlobalSearch from "@/components/GlobalSearch";
import MobileBottomNav from "@/components/MobileBottomNav";
import NetworkStatus from "@/components/NetworkStatus";
import { Button } from "@/components/ui/Button";
import { NAV_ITEMS } from "@/lib/navigation";
import { isManager } from "@/lib/access-control";
import { useAuth } from "@/lib/auth-context";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = useMemo(
    () => NAV_ITEMS.filter((item) => (user ? item.roles.includes(user.role) : false)),
    [user]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_0%,rgba(56,189,248,0.22),transparent_28%),radial-gradient(circle_at_92%_4%,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_50%_24%,rgba(15,23,42,0.05),transparent_34%),linear-gradient(135deg,#f8fafc_0%,#eef6ff_42%,#fff7ed_100%)] dark:bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(245,158,11,0.12),transparent_24%),radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.08),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        <Sidebar />
        <main className="flex-1 p-3 pb-20 sm:p-4 sm:pb-20 md:p-6 md:pb-6 lg:p-8">
          <a
            href="#page-content"
            className="sr-only rounded-md bg-slate-900 px-3 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 dark:bg-slate-100 dark:text-slate-950"
          >
            Skip to content
          </a>

          <div className="sticky top-2 z-30 mb-4 flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 p-2 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.45)] backdrop-blur-xl xl:hidden dark:border-slate-800 dark:bg-slate-900/90">
            <Button variant="secondary" onClick={() => setMenuOpen((prev) => !prev)}>
              <Menu className="h-4 w-4" />
              Menu
            </Button>
            <GlobalSearch className="ml-2 max-w-[260px]" />
          </div>

          {menuOpen ? (
            <div className="mb-4 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-medium",
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="mb-4 flex items-start justify-between gap-3">
            <Breadcrumbs />
            <div className="hidden items-center gap-3 lg:flex">
              <GlobalSearch />
              <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-xs text-slate-500 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.4)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <CircleHelp className="h-3.5 w-3.5" />
                Shortcuts: `/` search, `n` add, `esc` close
              </div>
              {!isManager(user?.role) ? (
                <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  Store Keeper mode: dashboard access disabled
                </div>
              ) : null}
            </div>
          </div>

          <div id="page-content" className="space-y-4 rounded-2xl">
            {children}
          </div>
        </main>
      </div>
      <NetworkStatus />
      {user ? <MobileBottomNav role={user.role} /> : null}
      <BackToTop />
    </div>
  );
}
