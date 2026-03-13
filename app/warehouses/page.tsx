"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ArrowRightLeft, Building2, MapPin } from "lucide-react";
import AppShell from "@/components/AppShell";
import ErrorAlert from "@/components/ErrorAlert";
import PageHeader from "@/components/PageHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth-context";
import { GET_PRODUCTS, GET_WAREHOUSES, TRANSFER_STOCK } from "@/lib/graphql";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";
import { Product, StockTransfer, WarehouseInsight } from "@/types/product";

interface WarehouseResponse {
  warehouses: WarehouseInsight[];
  stockTransfers: StockTransfer[];
}

interface ProductsResponse {
  products: Product[];
}

export default function WarehousesPage() {
  const { token, isBootstrapping } = useAuth();
  const { pushToast } = useToast();
  const [transferStock, { loading: transferring }] = useMutation(TRANSFER_STOCK, {
    refetchQueries: [{ query: GET_WAREHOUSES }, { query: GET_PRODUCTS }]
  });
  const { data, error, refetch } = useQuery<WarehouseResponse>(GET_WAREHOUSES, {
    skip: isBootstrapping || !token
  });
  const { data: productData } = useQuery<ProductsResponse>(GET_PRODUCTS, {
    skip: isBootstrapping || !token
  });

  const warehouses = data?.warehouses ?? [];
  const transfers = data?.stockTransfers ?? [];
  const products = productData?.products ?? [];

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("20");

  const ready = useMemo(() => warehouses.length > 1 && products.length > 0, [products.length, warehouses.length]);

  useEffect(() => {
    if (ready && !from) {
      setFrom(warehouses[0].id);
      setTo(warehouses[1].id);
      setSku(products[0].id);
    }
  }, [from, products, ready, warehouses]);

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <PageHeader title="Multi-Warehouse Control" subtitle="Move inventory between sites and monitor location health in real time." />

        {error ? <ErrorAlert title="Could not load warehouses" message="Warehouse data is unavailable." onRetry={() => refetch()} /> : null}

        <Card className="bg-gradient-to-br from-white via-cyan-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
          <div className="flex flex-wrap gap-2">
            {warehouses.map((warehouse) => (
              <Badge key={warehouse.id} className="gap-1 rounded-full px-3 py-1.5">
                <MapPin className="h-3 w-3" />
                {warehouse.name}
              </Badge>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id} className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-cyan-400 to-amber-400" />
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{warehouse.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{warehouse.code}</p>
                </div>
                <Building2 className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-3xl font-semibold text-slate-950 dark:text-white">{warehouse.totalUnits.toLocaleString()}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Units across all SKUs</p>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="text-sm text-slate-600 dark:text-slate-300">Low-stock SKUs</span>
                <Badge>{warehouse.lowStockSkus}</Badge>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Inter-Warehouse Transfer</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Transfer stock and write both ledger entries in one operation.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Select value={from} onChange={(e) => setFrom(e.target.value)}>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </Select>
              <Select value={to} onChange={(e) => setTo(e.target.value)}>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </Select>
              <Select value={sku} onChange={(e) => setSku(e.target.value)}>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.id} · {product.name}</option>
                ))}
              </Select>
              <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" />
            </div>
            <Button
              loading={transferring}
              onClick={async () => {
                await transferStock({ variables: { input: { productId: sku, fromWarehouseId: from, toWarehouseId: to, quantity: Number(qty), reason: "Rebalance transfer" } } });
                pushToast({ title: "Transfer completed", message: `${qty} units moved successfully`, tone: "success" });
              }}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transfer Stock
            </Button>
          </Card>

          <Card className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Transfers</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Latest cross-warehouse movements.</p>
            </div>
            <div className="space-y-2">
              {transfers.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No transfers yet.</p>
              ) : (
                transfers.slice(0, 6).map((transfer) => (
                  <div key={transfer.id} className="rounded-2xl border border-slate-200/80 p-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{transfer.reference}</p>
                      <Badge>{transfer.quantity} units</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">SKU {transfer.productId}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

