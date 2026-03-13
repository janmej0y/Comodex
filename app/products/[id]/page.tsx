"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "@apollo/client";
import { ArrowLeft, ArrowUpRight, Boxes, TrendingUp } from "lucide-react";
import AppShell from "@/components/AppShell";
import ErrorAlert from "@/components/ErrorAlert";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";
import { normalizeError, reportError } from "@/lib/error-utils";
import { ADJUST_STOCK, GET_PRODUCT, GET_PRODUCT_MOVEMENTS, GET_PRODUCT_TREND } from "@/lib/graphql";
import { getProductImage } from "@/lib/product-media";
import { useToast } from "@/lib/toast-context";
import { dateFormatter, inrFormatter } from "@/lib/utils";
import { Role } from "@/types/auth";
import { Product, ProductMovement, ProductTrendPoint } from "@/types/product";

interface ProductResponse {
  product: Product | null;
}

interface MovementResponse {
  productMovements: ProductMovement[];
}

interface TrendResponse {
  productTrend: ProductTrendPoint[];
}

interface AdjustResponse {
  adjustStock: Product;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { pushToast } = useToast();
  const { token, isBootstrapping } = useAuth();
  const shouldSkipQuery = isBootstrapping || !token;
  const [delta, setDelta] = useState("10");
  const [reason, setReason] = useState("Manager adjustment");
  const [pageError, setPageError] = useState<{ message: string; id: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<"plus" | "minus" | "custom" | null>(null);
  const { data: productData, loading: productLoading, error: productError } = useQuery<ProductResponse>(GET_PRODUCT, {
    variables: { id: params.id },
    skip: shouldSkipQuery
  });
  const { data: movementsData } = useQuery<MovementResponse>(GET_PRODUCT_MOVEMENTS, {
    variables: { productId: params.id },
    skip: shouldSkipQuery
  });
  const { data: trendData } = useQuery<TrendResponse>(GET_PRODUCT_TREND, {
    variables: { productId: params.id },
    skip: shouldSkipQuery
  });

  const [adjustStock] = useMutation<AdjustResponse>(ADJUST_STOCK, {
    refetchQueries: [
      { query: GET_PRODUCT, variables: { id: params.id } },
      { query: GET_PRODUCT_MOVEMENTS, variables: { productId: params.id } }
    ]
  });

  const product = productData?.product;
  const trend = trendData?.productTrend ?? [];
  const movements = movementsData?.productMovements ?? [];
  const productImage = product?.imageUrl || (product ? getProductImage(product.id) : "/products/default-product.svg");

  const pathD = useMemo(() => {
    if (!trend.length) {
      return "";
    }

    const max = Math.max(...trend.map((point) => point.value), 1);
    return trend
      .map((point, index) => {
        const x = (index / Math.max(1, trend.length - 1)) * 100;
        const y = 100 - (point.value / max) * 100;
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [trend]);

  return (
    <ProtectedRoute roles={[Role.MANAGER, Role.STORE_KEEPER]}>
      <AppShell>
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button className="w-full sm:w-auto" variant="secondary" onClick={() => history.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Link href="/products" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
              All products
            </Link>
          </div>

          {productLoading ? (
            <Card className="h-44 animate-pulse" />
          ) : productError ? (
            <ErrorAlert
              title="Could not load product"
              message={normalizeError(productError, "product_detail_query", "Please reload this page.").userMessage}
              onRetry={() => location.reload()}
            />
          ) : !product ? (
            <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">Product not found.</p>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-3">
                <Card className="overflow-hidden md:col-span-2">
                  <div className="grid gap-4 sm:gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative min-h-[220px] overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(226,232,240,0.72))] sm:min-h-[280px] sm:rounded-[1.6rem] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.88),rgba(2,6,23,0.92))]">
                      <Image
                        src={productImage}
                        alt={product.name}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1280px) 100vw, 40vw"
                      />
                      <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/70">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Visual Reference</p>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{product.category}</p>
                      </div>
                    </div>
                    <div className="min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Product Profile</p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">{product.name}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{product.id}</p>
                    </div>
                    <Badge className="w-fit">{product.category}</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Unit Price</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{inrFormatter.format(product.unitPrice)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Quantity</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{product.quantity}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Value</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{inrFormatter.format(product.quantity * product.unitPrice)}</p>
                    </div>
                  </div>
                    <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/85 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Warehouse Distribution</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {product.balances.slice(0, 4).map((balance) => (
                          <div key={balance.warehouseId} className="rounded-xl border border-slate-200/70 bg-white/90 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{balance.warehouseName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{balance.quantity} units</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Quick Actions</p>
                  <div className="mt-3 space-y-2">
                    <Button
                      className="w-full"
                      loading={actionLoading === "plus"}
                      onClick={async () => {
                        setActionLoading("plus");
                        try {
                          await adjustStock({
                            variables: { input: { productId: product.id, delta: 5, reason: "Quick increment" } },
                            optimisticResponse: {
                              adjustStock: {
                                ...product,
                                quantity: Math.max(0, product.quantity + 5),
                                updatedAt: new Date().toISOString()
                              }
                            }
                          });
                          pushToast({ title: "Stock adjusted", message: "+5 quantity", tone: "success" });
                        } catch (error) {
                          const normalized = normalizeError(error, "product_detail_quick_increment");
                          setPageError({ message: normalized.userMessage, id: normalized.id });
                          reportError(error, "product_detail_quick_increment", { id: product.id });
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Add 5 Units
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      loading={actionLoading === "minus"}
                      onClick={async () => {
                        setActionLoading("minus");
                        try {
                          await adjustStock({
                            variables: { input: { productId: product.id, delta: -5, reason: "Quick decrement" } },
                            optimisticResponse: {
                              adjustStock: {
                                ...product,
                                quantity: Math.max(0, product.quantity - 5),
                                updatedAt: new Date().toISOString()
                              }
                            }
                          });
                          pushToast({
                            title: "Stock adjusted",
                            message: "-5 quantity",
                            tone: "info",
                            actionLabel: "Undo",
                            onAction: () => {
                              adjustStock({
                                variables: { input: { productId: product.id, delta: 5, reason: "Undo quick decrement" } }
                              })
                                .then(() => pushToast({ title: "Undo complete", message: "Quantity restored", tone: "success" }))
                                .catch((undoError) => {
                                  const normalized = normalizeError(undoError, "product_detail_quick_undo");
                                  setPageError({ message: normalized.userMessage, id: normalized.id });
                                  reportError(undoError, "product_detail_quick_undo", { id: product.id });
                                });
                            }
                          });
                        } catch (error) {
                          const normalized = normalizeError(error, "product_detail_quick_decrement");
                          setPageError({ message: normalized.userMessage, id: normalized.id });
                          reportError(error, "product_detail_quick_decrement", { id: product.id });
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                    >
                      <Boxes className="h-4 w-4" />
                      Remove 5 Units
                    </Button>
                    <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Custom Adjust</p>
                      <Input
                        className="mb-2"
                        type="number"
                        value={delta}
                        onChange={(e) => setDelta(e.target.value)}
                        placeholder="Delta (+/-)"
                      />
                      <Input
                        className="mb-2"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason"
                      />
                      <Button
                        variant="secondary"
                        className="w-full"
                        loading={actionLoading === "custom"}
                        onClick={async () => {
                          const parsed = Number(delta);
                          if (Number.isNaN(parsed) || parsed === 0) {
                            pushToast({ title: "Invalid delta", message: "Enter a non-zero number", tone: "error" });
                            return;
                          }
                          setActionLoading("custom");
                          try {
                            await adjustStock({
                              variables: { input: { productId: product.id, delta: parsed, reason } },
                              optimisticResponse: {
                                adjustStock: {
                                  ...product,
                                  quantity: Math.max(0, product.quantity + parsed),
                                  updatedAt: new Date().toISOString()
                                }
                              }
                            });
                            pushToast({
                              title: "Custom adjustment saved",
                              message: `${parsed > 0 ? "+" : ""}${parsed}`,
                              tone: "success",
                              actionLabel: parsed < 0 ? "Undo" : undefined,
                              onAction:
                                parsed < 0
                                  ? () => {
                                      adjustStock({
                                        variables: { input: { productId: product.id, delta: Math.abs(parsed), reason: "Undo custom decrement" } }
                                      })
                                        .then(() => pushToast({ title: "Undo complete", message: "Custom change reverted", tone: "info" }))
                                        .catch((undoError) => {
                                          const normalized = normalizeError(undoError, "product_detail_custom_undo");
                                          setPageError({ message: normalized.userMessage, id: normalized.id });
                                          reportError(undoError, "product_detail_custom_undo", { id: product.id });
                                        });
                                    }
                                  : undefined
                            });
                          } catch (error) {
                            const normalized = normalizeError(error, "product_detail_custom_adjust");
                            setPageError({ message: normalized.userMessage, id: normalized.id });
                            reportError(error, "product_detail_custom_adjust", { id: product.id, delta: parsed, reason });
                          } finally {
                            setActionLoading(null);
                          }
                        }}
                      >
                        Apply Custom Adjustment
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
              {pageError ? <ErrorAlert title="Action failed" message={pageError.message} errorId={pageError.id} onRetry={() => setPageError(null)} /> : null}

              <div className="grid gap-4 xl:grid-cols-5">
                <Card className="md:col-span-3">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">7-Day Stock Trend</p>
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <svg viewBox="0 0 100 100" className="h-48 w-full" role="img" aria-label="Stock trend chart">
                      <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500" />
                    </svg>
                    <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400">
                      {trend.map((point) => (
                        <div key={point.label}>{point.label}</div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="md:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Recent Movements</p>
                    <Badge>{movements.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {movements.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No movement yet.</p>
                    ) : (
                      movements.slice(0, 6).map((movement) => (
                        <div key={movement.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <Badge>{movement.type}</Badge>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {dateFormatter.format(new Date(movement.createdAt))}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-700 dark:text-slate-200">{movement.reason}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Quantity: {movement.quantity}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              <Card className="border-brand-200 bg-brand-50/60 dark:border-brand-900/60 dark:bg-brand-950/30">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Next Best Action</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {product.quantity < 40
                    ? "Stock is under threshold. Raise replenishment order within 24 hours."
                    : "Stock level is healthy. Monitor demand trend and avoid over-ordering."}
                </p>
              </Card>
            </>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
