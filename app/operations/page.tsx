"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ClipboardCheck, ShoppingCart, Truck } from "lucide-react";
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
import { CREATE_PURCHASE_ORDER, GET_PROCUREMENT, RECEIVE_PURCHASE_ORDER } from "@/lib/graphql";
import { useToast } from "@/lib/toast-context";
import { inrFormatter } from "@/lib/utils";
import { Role } from "@/types/auth";
import { GoodsReceipt, Product, PurchaseOrder, WarehouseInsight } from "@/types/product";

interface ProcurementResponse {
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  warehouses: WarehouseInsight[];
  products: Product[];
}

export default function OperationsPage() {
  const [mode, setMode] = useState<"PO" | "SALE" | "RECEIPT">("PO");
  const [partner, setPartner] = useState("Acme Supplier Pvt Ltd");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("50");
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedPoId, setSelectedPoId] = useState("");
  const { pushToast } = useToast();
  const { token, isBootstrapping } = useAuth();
  const { data, error, refetch } = useQuery<ProcurementResponse>(GET_PROCUREMENT, {
    skip: isBootstrapping || !token
  });
  const [createPurchaseOrder, { loading: creating }] = useMutation(CREATE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PROCUREMENT }]
  });
  const [receivePurchaseOrder, { loading: receiving }] = useMutation(RECEIVE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PROCUREMENT }]
  });

  const purchaseOrders = data?.purchaseOrders ?? [];
  const receipts = data?.goodsReceipts ?? [];
  const warehouses = data?.warehouses ?? [];
  const products = data?.products ?? [];

  useEffect(() => {
    if (!warehouseId && warehouses[0]) {
      setWarehouseId(warehouses[0].id);
    }
    if (!item && products[0]) {
      setItem(products[0].id);
    }
    if (!selectedPoId && purchaseOrders[0]) {
      setSelectedPoId(purchaseOrders[0].id);
    }
  }, [item, products, purchaseOrders, selectedPoId, warehouseId, warehouses]);

  const selectedProduct = useMemo(() => products.find((product) => product.id === item), [item, products]);

  return (
    <ProtectedRoute roles={[Role.MANAGER]}>
      <AppShell>
        <PageHeader title="Purchase & Receipt Workflow" subtitle="Approve purchase orders, receive goods, and write inventory into the warehouse ledger." />

        {error ? <ErrorAlert title="Could not load procurement data" message="Operations data is unavailable." onRetry={() => refetch()} /> : null}

        <Card>
          <div className="flex flex-wrap gap-2">
            <Button variant={mode === "PO" ? "primary" : "secondary"} onClick={() => setMode("PO")}>
              <ShoppingCart className="h-4 w-4" />
              Purchase Order
            </Button>
            <Button variant={mode === "SALE" ? "primary" : "secondary"} onClick={() => setMode("SALE")}>
              <Truck className="h-4 w-4" />
              Dispatch View
            </Button>
            <Button variant={mode === "RECEIPT" ? "primary" : "secondary"} onClick={() => setMode("RECEIPT")}>
              <ClipboardCheck className="h-4 w-4" />
              Goods Receipt
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{mode === "PO" ? "Create Purchase Order" : mode === "RECEIPT" ? "Receive Purchase Order" : "Dispatch Snapshot"}</h3>

            {mode === "PO" ? (
              <>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Input value={partner} onChange={(e) => setPartner(e.target.value)} placeholder="Supplier" />
                  <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                    ))}
                  </Select>
                  <Select value={item} onChange={(e) => setItem(e.target.value)}>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.id} · {product.name}</option>
                    ))}
                  </Select>
                  <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="Quantity" />
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Estimated value</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{inrFormatter.format((selectedProduct?.unitPrice ?? 0) * Number(qty || 0))}</p>
                </div>
                <Button
                  loading={creating}
                  onClick={async () => {
                    await createPurchaseOrder({
                      variables: {
                        input: {
                          supplier: partner,
                          warehouseId,
                          lines: [{ productId: item, quantityOrdered: Number(qty), unitPrice: selectedProduct?.unitPrice ?? 0 }]
                        }
                      }
                    });
                    pushToast({ title: "Purchase order created", message: `${qty} units requested`, tone: "success" });
                  }}
                >
                  Save Purchase Order
                </Button>
              </>
            ) : mode === "RECEIPT" ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <Select value={selectedPoId} onChange={(e) => setSelectedPoId(e.target.value)}>
                    {purchaseOrders.map((order) => (
                      <option key={order.id} value={order.id}>{order.reference} · {order.supplier}</option>
                    ))}
                  </Select>
                  <Select value={item} onChange={(e) => setItem(e.target.value)}>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.id} · {product.name}</option>
                    ))}
                  </Select>
                  <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="Received qty" />
                </div>
                <Button
                  loading={receiving}
                  onClick={async () => {
                    await receivePurchaseOrder({
                      variables: {
                        input: {
                          purchaseOrderId: selectedPoId,
                          lines: [{ productId: item, quantity: Number(qty) }],
                          notes: "Receipt posted from operations panel"
                        }
                      }
                    });
                    pushToast({ title: "Goods receipt posted", message: `${qty} units booked into inventory`, tone: "success" });
                  }}
                >
                  Post Goods Receipt
                </Button>
              </>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Available {product.quantity} units</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Purchase Orders</h3>
                <Badge>{purchaseOrders.length}</Badge>
              </div>
              <div className="space-y-2">
                {purchaseOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="rounded-2xl border border-slate-200/80 p-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{order.reference}</p>
                      <Badge>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{order.supplier}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Goods Receipts</h3>
                <Badge>{receipts.length}</Badge>
              </div>
              <div className="space-y-2">
                {receipts.slice(0, 5).map((receipt) => (
                  <div key={receipt.id} className="rounded-2xl border border-slate-200/80 p-3 dark:border-slate-800">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{receipt.reference}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{receipt.lines.reduce((sum, line) => sum + line.quantity, 0)} units received</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

