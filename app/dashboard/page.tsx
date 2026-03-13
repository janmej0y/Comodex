"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Boxes, ChartNoAxesCombined, IndianRupee, Layers3, ShoppingCart, Warehouse } from "lucide-react";
import AppShell from "@/components/AppShell";
import ErrorAlert from "@/components/ErrorAlert";
import PageHeader from "@/components/PageHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { GET_DASHBOARD_STATS } from "@/lib/graphql";
import { inrFormatter } from "@/lib/utils";
import { Role } from "@/types/auth";
import { DashboardStats } from "@/types/product";

interface DashboardResponse {
  dashboardStats: DashboardStats;
}

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { token, isBootstrapping } = useAuth();
  const { data, loading, error, refetch } = useQuery<DashboardResponse>(GET_DASHBOARD_STATS, {
    skip: isBootstrapping || !token
  });

  const stats = data?.dashboardStats;

  const cards = [
    {
      title: "Total Stock",
      value: loading ? "..." : stats?.totalStock.toLocaleString() ?? "0",
      icon: Boxes,
      tone: "from-cyan-500/40 via-sky-500/20 to-transparent",
      onClick: () => router.push("/products")
    },
    {
      title: "Market Value",
      value: loading ? "..." : inrFormatter.format(stats?.marketValue ?? 0),
      icon: IndianRupee,
      tone: "from-emerald-500/40 via-teal-500/20 to-transparent",
      onClick: () => router.push("/products")
    },
    {
      title: "Low Inventory",
      value: loading ? "..." : String(stats?.lowInventory ?? 0),
      icon: AlertTriangle,
      tone: "from-amber-500/35 via-orange-500/20 to-transparent",
      onClick: () => router.push("/alerts")
    },
    {
      title: "Pending PO",
      value: loading ? "..." : String(stats?.pendingPurchaseOrders ?? 0),
      icon: ShoppingCart,
      tone: "from-violet-500/35 via-fuchsia-500/20 to-transparent",
      onClick: () => router.push("/operations")
    }
  ];

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <PageHeader
          title="Executive Dashboard"
          subtitle="Live aggregation from warehouses, ledger, procurement, and alert rules."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => router.push("/warehouses")}>
                <Warehouse className="h-4 w-4" />
                Warehouse Control
              </Button>
              <Button onClick={() => router.push("/operations")}>
                <ShoppingCart className="h-4 w-4" />
                Procurement Desk
              </Button>
            </div>
          }
        />

        {error ? <ErrorAlert title="Could not load dashboard" message="Live analytics are temporarily unavailable." onRetry={() => refetch()} /> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.05 }}
                whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
                onClick={card.onClick}
                className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 text-left shadow-[0_24px_80px_-38px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.tone}`} />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{card.title}</p>
                    <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{card.value}</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                    <Icon className="h-5 w-5 text-slate-700 dark:text-slate-100" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden border-transparent bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Warehouse Performance</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of units and low-stock SKUs by location.</p>
              </div>
              <ChartNoAxesCombined className="h-4 w-4 text-slate-500" />
            </div>
            <div className="space-y-3">
              {stats?.warehouseInsights.map((item) => (
                <button
                  key={item.warehouseId}
                  onClick={() => router.push("/warehouses")}
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 text-left transition hover:border-brand-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-brand-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{item.warehouseName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.totalUnits.toLocaleString()} units</p>
                    </div>
                    <Badge>{item.lowStockSkus} low-stock SKUs</Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-transparent bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white shadow-[0_24px_80px_-40px_rgba(8,47,73,0.8)] dark:from-slate-950 dark:via-slate-950 dark:to-brand-950">
            <p className="text-sm font-medium text-slate-200">Operations Pulse</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Active Alerts</p>
                <p className="mt-2 text-3xl font-semibold">{stats?.alertsTriggered ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Warehouses</p>
                <p className="mt-2 text-3xl font-semibold">{stats?.warehouseCount ?? 0}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <p className="text-sm font-medium text-slate-200">Recent Receipts Trend</p>
              <div className="grid grid-cols-3 gap-2">
                {stats?.receiptsTrend.slice(-6).map((point) => (
                  <div key={point.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-slate-300">{point.label}</p>
                    <p className="mt-2 text-lg font-semibold">{point.value}</p>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="w-full border-white/15 bg-white/10 text-white hover:bg-white/15 dark:border-white/10 dark:bg-white/10" onClick={() => router.push("/audit")}>
                <Layers3 className="h-4 w-4" />
                Open Audit Trail
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

