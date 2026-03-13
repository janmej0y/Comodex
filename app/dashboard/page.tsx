"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Boxes, ChartNoAxesCombined, IndianRupee, Layers3, TrendingUp } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { GET_PRODUCTS } from "@/lib/graphql";
import { inrFormatter } from "@/lib/utils";
import { Role } from "@/types/auth";
import { Product } from "@/types/product";

interface ProductsResponse {
  products: Product[];
}

type Range = "7d" | "30d" | "90d";

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { token, isBootstrapping } = useAuth();
  const { data, loading } = useQuery<ProductsResponse>(GET_PRODUCTS, {
    skip: isBootstrapping || !token
  });
  const [range, setRange] = useState<Range>("30d");

  const stats = useMemo(() => {
    const products = data?.products ?? [];
    const totalStock = products.reduce((sum, item) => sum + item.quantity, 0);
    const marketValue = products.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const lowInventory = products.filter((item) => item.quantity <= 40).length;
    const deadStock = products.filter((item) => item.quantity === 0).length;

    const categoryMap = new Map<string, number>();
    products.forEach((item) => {
      const current = categoryMap.get(item.category) ?? 0;
      categoryMap.set(item.category, current + item.quantity * item.unitPrice);
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    return {
      totalStock,
      marketValue,
      lowInventory,
      deadStock,
      topCategories
    };
  }, [data?.products]);

  const cards = [
    {
      title: "Total Stock",
      value: loading ? "..." : stats.totalStock.toLocaleString(),
      icon: Boxes,
      tone: "from-cyan-500/30 to-sky-500/15",
      onClick: () => router.push("/products")
    },
    {
      title: "Market Value",
      value: loading ? "..." : inrFormatter.format(stats.marketValue),
      icon: IndianRupee,
      tone: "from-emerald-500/30 to-teal-500/15",
      onClick: () => router.push("/products")
    },
    {
      title: "Low Inventory",
      value: loading ? "..." : String(stats.lowInventory),
      icon: AlertTriangle,
      tone: "from-amber-500/30 to-orange-500/15",
      onClick: () => router.push("/products?lowStock=1")
    },
    {
      title: "Dead Stock",
      value: loading ? "..." : String(stats.deadStock),
      icon: Layers3,
      tone: "from-rose-500/30 to-fuchsia-500/15",
      onClick: () => router.push("/products")
    }
  ];

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <PageHeader
          title="Executive Dashboard"
          subtitle="Monitor stock levels and valuation with drill-down analytics."
          actions={
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
              {(["7d", "30d", "90d"] as Range[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setRange(item)}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    range === item
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
                      : "text-slate-600 dark:text-slate-300"
                  ].join(" ")}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.06 }}
                whileHover={reduceMotion ? undefined : { y: -4, rotateX: 2, rotateY: -2 }}
                onClick={card.onClick}
                className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-6 text-left shadow-soft dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-90`} />
                <div className="relative z-10">
                  <div className="mb-7 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{card.title}</p>
                    <div className="rounded-lg border border-white/50 bg-white/50 p-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <Icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                    </div>
                  </div>
                  <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{card.value}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Category Performance ({range.toUpperCase()})</p>
              <ChartNoAxesCombined className="h-4 w-4 text-slate-500" />
            </div>
            <div className="space-y-3">
              {stats.topCategories.map((item) => (
                <button
                  key={item.category}
                  onClick={() => router.push(`/products?category=${encodeURIComponent(item.category)}`)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{item.category}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{inrFormatter.format(item.value)}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Action Center</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Jump directly into operational views.</p>
            <div className="mt-3 space-y-2">
              <Button className="w-full" onClick={() => router.push("/products?lowStock=1")}>
                <AlertTriangle className="h-4 w-4" />
                Review Low Stock
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => router.push("/products")}>
                <TrendingUp className="h-4 w-4" />
                Open Inventory Table
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>Realtime-ready UI</Badge>
              <Badge>Drill-down enabled</Badge>
            </div>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
