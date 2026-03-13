"use client";

import { ApolloClient, ApolloLink, InMemoryCache, Observable } from "@apollo/client";
import { createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { reportError } from "@/lib/error-utils";
import { Role } from "@/types/auth";
import {
  AlertRule,
  AuditEvent,
  DashboardStats,
  GoodsReceipt,
  LowStockAlert,
  Product,
  ProductMovement,
  ProductTrendPoint,
  PurchaseOrder,
  StockTransfer,
  WarehouseInsight
} from "@/types/product";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const AUTH_STORAGE_KEY = "commodex-session";

const warehousesDb: WarehouseInsight[] = [
  { id: "W-1", code: "MUM-CEN", name: "Mumbai Central", city: "Mumbai", totalUnits: 0, lowStockSkus: 0 },
  { id: "W-2", code: "DEL-NOR", name: "Delhi North", city: "Delhi", totalUnits: 0, lowStockSkus: 0 },
  { id: "W-3", code: "BLR-HUB", name: "Bangalore Hub", city: "Bangalore", totalUnits: 0, lowStockSkus: 0 }
];

let productsDb: Product[] = [
  {
    id: "P-101",
    name: "Arabica Coffee Beans",
    category: "Beverage",
    unitPrice: 1249.99,
    quantity: 250,
    reorderLevel: 60,
    lowStock: false,
    updatedAt: new Date().toISOString(),
    balances: [
      { warehouseId: "W-1", warehouseCode: "MUM-CEN", warehouseName: "Mumbai Central", quantity: 120 },
      { warehouseId: "W-2", warehouseCode: "DEL-NOR", warehouseName: "Delhi North", quantity: 80 },
      { warehouseId: "W-3", warehouseCode: "BLR-HUB", warehouseName: "Bangalore Hub", quantity: 50 }
    ]
  },
  {
    id: "P-102",
    name: "Premium Wheat Flour",
    category: "Grains",
    unitPrice: 425.75,
    quantity: 68,
    reorderLevel: 50,
    lowStock: false,
    updatedAt: new Date().toISOString(),
    balances: [
      { warehouseId: "W-1", warehouseCode: "MUM-CEN", warehouseName: "Mumbai Central", quantity: 28 },
      { warehouseId: "W-2", warehouseCode: "DEL-NOR", warehouseName: "Delhi North", quantity: 25 },
      { warehouseId: "W-3", warehouseCode: "BLR-HUB", warehouseName: "Bangalore Hub", quantity: 15 }
    ]
  },
  {
    id: "P-103",
    name: "Himalayan Rock Salt",
    category: "Spices",
    unitPrice: 310.2,
    quantity: 24,
    reorderLevel: 40,
    lowStock: true,
    updatedAt: new Date().toISOString(),
    balances: [
      { warehouseId: "W-1", warehouseCode: "MUM-CEN", warehouseName: "Mumbai Central", quantity: 12 },
      { warehouseId: "W-2", warehouseCode: "DEL-NOR", warehouseName: "Delhi North", quantity: 8 },
      { warehouseId: "W-3", warehouseCode: "BLR-HUB", warehouseName: "Bangalore Hub", quantity: 4 }
    ]
  },
  {
    id: "P-104",
    name: "Cold-Pressed Olive Oil",
    category: "Cooking",
    unitPrice: 895.5,
    quantity: 130,
    reorderLevel: 45,
    lowStock: false,
    updatedAt: new Date().toISOString(),
    balances: [
      { warehouseId: "W-1", warehouseCode: "MUM-CEN", warehouseName: "Mumbai Central", quantity: 65 },
      { warehouseId: "W-2", warehouseCode: "DEL-NOR", warehouseName: "Delhi North", quantity: 35 },
      { warehouseId: "W-3", warehouseCode: "BLR-HUB", warehouseName: "Bangalore Hub", quantity: 30 }
    ]
  }
];

let movementDb: ProductMovement[] = [
  { id: "M-1", productId: "P-101", warehouseId: "W-1", type: "IN", quantity: 100, reason: "Supplier restock", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "M-2", productId: "P-101", warehouseId: "W-2", type: "TRANSFER_OUT", quantity: 20, reason: "Branch transfer", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "M-3", productId: "P-103", warehouseId: "W-3", type: "ADJUSTMENT", quantity: 4, reason: "Stock correction", createdAt: new Date(Date.now() - 86400000).toISOString() }
];

let purchaseOrdersDb: PurchaseOrder[] = [
  {
    id: "PO-1",
    reference: "PO-2026-0001",
    supplier: "Acme Supplier Pvt Ltd",
    status: "PARTIALLY_RECEIVED",
    warehouseId: "W-1",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lines: [
      { id: "POL-1", productId: "P-101", quantityOrdered: 90, quantityReceived: 40, unitPrice: 1180 },
      { id: "POL-2", productId: "P-103", quantityOrdered: 50, quantityReceived: 20, unitPrice: 280 }
    ]
  }
];

let receiptsDb: GoodsReceipt[] = [
  {
    id: "GR-1",
    reference: "GRN-2026-0001",
    purchaseOrderId: "PO-1",
    warehouseId: "W-1",
    notes: "Partial receipt confirmed",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lines: [
      { id: "GRL-1", productId: "P-101", quantity: 40 },
      { id: "GRL-2", productId: "P-103", quantity: 20 }
    ]
  }
];

let alertRulesDb: AlertRule[] = [
  { id: "low-stock-global", name: "Default low stock", threshold: 40, channel: "EMAIL", isActive: true, createdAt: new Date().toISOString() }
];

let transfersDb: StockTransfer[] = [];
let auditDb: AuditEvent[] = [
  { id: "A-1", action: "SYSTEM_BOOTSTRAP", entityType: "SYSTEM", entityId: "seed", metadata: "{\"mode\":\"mock\"}", createdAt: new Date().toISOString() }
];

function refreshProductState(productId: string) {
  productsDb = productsDb.map((product) => {
    if (product.id !== productId) {
      return product;
    }

    const quantity = product.balances.reduce((sum, balance) => sum + balance.quantity, 0);
    return {
      ...product,
      quantity,
      lowStock: quantity <= product.reorderLevel,
      updatedAt: new Date().toISOString()
    };
  });
}

function refreshWarehouseState() {
  for (const warehouse of warehousesDb) {
    const scoped = productsDb.flatMap((product) => product.balances.filter((balance) => balance.warehouseId === warehouse.id).map((balance) => ({ balance, product })));
    warehouse.totalUnits = scoped.reduce((sum, entry) => sum + entry.balance.quantity, 0);
    warehouse.lowStockSkus = scoped.filter((entry) => entry.balance.quantity <= entry.product.reorderLevel).length;
  }
}

function buildTrend(productId: string): ProductTrendPoint[] {
  const relevant = movementDb.filter((movement) => movement.productId === productId).slice(0, 7).reverse();
  if (!relevant.length) {
    const base = productsDb.find((product) => product.id === productId)?.quantity ?? 0;
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => ({ label, value: Math.max(0, base - 10 + index * 4) }));
  }

  let rolling = 0;
  return relevant.map((movement) => {
    rolling += movement.type === "OUT" || movement.type === "TRANSFER_OUT" ? -movement.quantity : movement.quantity;
    return {
      label: new Date(movement.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(0, rolling)
    };
  });
}

function buildDashboardStats(): DashboardStats {
  refreshWarehouseState();
  const totalStock = productsDb.reduce((sum, item) => sum + item.quantity, 0);
  const marketValue = productsDb.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const lowInventory = productsDb.filter((item) => item.lowStock).length;
  const alertsTriggered = productsDb.flatMap((product) => product.balances.filter((balance) => balance.quantity <= product.reorderLevel)).length;

  return {
    totalStock,
    marketValue,
    lowInventory,
    warehouseCount: warehousesDb.length,
    pendingPurchaseOrders: purchaseOrdersDb.filter((item) => item.status !== "RECEIVED").length,
    alertsTriggered,
    warehouseInsights: warehousesDb.map((warehouse) => ({
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      totalUnits: warehouse.totalUnits,
      lowStockSkus: warehouse.lowStockSkus
    })),
    receiptsTrend: receiptsDb.slice(-6).map((receipt) => ({
      label: new Date(receipt.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: receipt.lines.reduce((sum, line) => sum + line.quantity, 0)
    }))
  };
}

function buildLowStockAlerts(): LowStockAlert[] {
  return productsDb.flatMap((product) =>
    product.balances
      .filter((balance) => balance.quantity <= product.reorderLevel)
      .map((balance) => ({
        productId: product.id,
        productName: product.name,
        warehouseId: balance.warehouseId,
        warehouseName: balance.warehouseName,
        quantity: balance.quantity,
        threshold: product.reorderLevel,
        severity: balance.quantity === 0 ? "critical" : balance.quantity <= Math.ceil(product.reorderLevel / 2) ? "high" : "medium"
      }))
  );
}

refreshWarehouseState();

const mockLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    const run = async () => {
      await wait(8);
      const { operationName, variables } = operation;

      if (operationName === "LoginUser") {
        const input = variables?.input as { email: string; password: string; role: Role };

        if (!input?.email || !input?.password || input.password.length < 6) {
          observer.error(new Error("Invalid credentials."));
          return;
        }

        observer.next({
          data: {
            login: {
              token: `mock-jwt-${Date.now()}`,
              refreshToken: `mock-refresh-${Date.now()}`,
              user: {
                id: crypto.randomUUID(),
                name: input.email.split("@")[0] || "Operator",
                email: input.email,
                role: input.role
              }
            }
          }
        });
        observer.complete();
        return;
      }

      if (operationName === "SignupUser") {
        const input = variables?.input as { name: string; email: string; password: string; role: Role };
        if (!input?.name || !input?.email || !input?.password || input.password.length < 6) {
          observer.error(new Error("Invalid signup payload."));
          return;
        }

        observer.next({
          data: {
            signup: {
              id: crypto.randomUUID(),
              name: input.name,
              email: input.email,
              role: input.role
            }
          }
        });
        observer.complete();
        return;
      }

      if (operationName === "RefreshSession") {
        observer.next({
          data: {
            refreshSession: {
              token: `mock-jwt-${Date.now()}`,
              refreshToken: `mock-refresh-${Date.now()}`,
              user: {
                id: crypto.randomUUID(),
                name: "Operator",
                email: "manager@comodex.io",
                role: Role.MANAGER
              }
            }
          }
        });
        observer.complete();
        return;
      }

      if (operationName === "LogoutUser") {
        observer.next({ data: { logout: true } });
        observer.complete();
        return;
      }

      if (operationName === "GetDashboardStats") {
        observer.next({ data: { dashboardStats: buildDashboardStats() } });
        observer.complete();
        return;
      }

      if (operationName === "GetProducts") {
        observer.next({ data: { products: productsDb } });
        observer.complete();
        return;
      }

      if (operationName === "GetProduct") {
        const product = productsDb.find((item) => item.id === variables?.id) ?? null;
        observer.next({ data: { product } });
        observer.complete();
        return;
      }

      if (operationName === "GetProductMovements") {
        observer.next({ data: { productMovements: movementDb.filter((item) => item.productId === variables?.productId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) } });
        observer.complete();
        return;
      }

      if (operationName === "GetProductTrend") {
        observer.next({ data: { productTrend: buildTrend(variables?.productId) } });
        observer.complete();
        return;
      }

      if (operationName === "GetWarehouses") {
        refreshWarehouseState();
        observer.next({ data: { warehouses: warehousesDb, stockTransfers: transfersDb } });
        observer.complete();
        return;
      }

      if (operationName === "GetProcurement") {
        refreshWarehouseState();
        observer.next({ data: { purchaseOrders: purchaseOrdersDb, goodsReceipts: receiptsDb, warehouses: warehousesDb, products: productsDb } });
        observer.complete();
        return;
      }

      if (operationName === "GetAlerts") {
        observer.next({ data: { alertRules: alertRulesDb, lowStockAlerts: buildLowStockAlerts() } });
        observer.complete();
        return;
      }

      if (operationName === "GetAuditTrail") {
        observer.next({ data: { auditTrail: auditDb.slice(0, variables?.limit ?? 30) } });
        observer.complete();
        return;
      }

      if (operationName === "UpsertProduct") {
        const input = variables?.input as Omit<Product, "updatedAt" | "balances" | "lowStock"> & { warehouseId?: string };
        const now = new Date().toISOString();
        const existingIndex = productsDb.findIndex((item) => item.id === input.id);
        const warehouse = warehousesDb.find((item) => item.id === (input.warehouseId ?? warehousesDb[0].id)) ?? warehousesDb[0];

        if (existingIndex >= 0) {
          productsDb[existingIndex] = {
            ...productsDb[existingIndex],
            id: input.id,
            name: input.name,
            category: input.category,
            unitPrice: input.unitPrice,
            reorderLevel: input.reorderLevel,
            updatedAt: now
          };

          const balanceIndex = productsDb[existingIndex].balances.findIndex((balance) => balance.warehouseId === warehouse.id);
          if (balanceIndex >= 0) {
            productsDb[existingIndex].balances[balanceIndex].quantity = input.quantity;
          } else {
            productsDb[existingIndex].balances.unshift({ warehouseId: warehouse.id, warehouseCode: warehouse.code, warehouseName: warehouse.name, quantity: input.quantity });
          }
          refreshProductState(input.id);
        } else {
          productsDb = [{
            id: input.id,
            name: input.name,
            category: input.category,
            unitPrice: input.unitPrice,
            quantity: input.quantity,
            reorderLevel: input.reorderLevel,
            lowStock: input.quantity <= input.reorderLevel,
            updatedAt: now,
            balances: [{ warehouseId: warehouse.id, warehouseCode: warehouse.code, warehouseName: warehouse.name, quantity: input.quantity }]
          }, ...productsDb];
        }

        movementDb = [{ id: `M-${Date.now()}`, productId: input.id, warehouseId: warehouse.id, type: existingIndex >= 0 ? "ADJUSTMENT" : "IN", quantity: input.quantity, reason: existingIndex >= 0 ? "Manual edit" : "Initial stock", createdAt: now }, ...movementDb];
        auditDb = [{ id: `A-${Date.now()}`, action: existingIndex >= 0 ? "PRODUCT_UPDATED" : "PRODUCT_CREATED", entityType: "PRODUCT", entityId: input.id, createdAt: now }, ...auditDb];
        refreshWarehouseState();
        observer.next({ data: { upsertProduct: productsDb.find((item) => item.id === input.id) } });
        observer.complete();
        return;
      }

      if (operationName === "AdjustStock") {
        const input = variables?.input as { productId: string; delta: number; reason: string; warehouseId?: string };
        const product = productsDb.find((item) => item.id === input.productId);
        if (!product) {
          observer.error(new Error("Product not found."));
          return;
        }

        const warehouseId = input.warehouseId ?? product.balances[0]?.warehouseId ?? warehousesDb[0].id;
        const warehouse = warehousesDb.find((item) => item.id === warehouseId) ?? warehousesDb[0];
        const balance = product.balances.find((item) => item.warehouseId === warehouseId);
        if (balance) {
          balance.quantity = Math.max(0, balance.quantity + input.delta);
        } else {
          product.balances.push({ warehouseId: warehouse.id, warehouseCode: warehouse.code, warehouseName: warehouse.name, quantity: Math.max(0, input.delta) });
        }
        refreshProductState(product.id);
        movementDb = [{ id: `M-${Date.now()}`, productId: product.id, warehouseId, type: "ADJUSTMENT", quantity: Math.abs(input.delta), reason: input.reason, createdAt: new Date().toISOString() }, ...movementDb];
        auditDb = [{ id: `A-${Date.now()}`, action: "STOCK_ADJUSTED", entityType: "PRODUCT", entityId: product.id, createdAt: new Date().toISOString() }, ...auditDb];
        refreshWarehouseState();
        observer.next({ data: { adjustStock: productsDb.find((item) => item.id === product.id) } });
        observer.complete();
        return;
      }

      if (operationName === "TransferStock") {
        const input = variables?.input as { productId: string; fromWarehouseId: string; toWarehouseId: string; quantity: number; reason: string };
        const product = productsDb.find((item) => item.id === input.productId);
        if (!product) {
          observer.error(new Error("Product not found."));
          return;
        }

        const fromBalance = product.balances.find((item) => item.warehouseId === input.fromWarehouseId);
        const toWarehouse = warehousesDb.find((item) => item.id === input.toWarehouseId);
        if (!fromBalance || fromBalance.quantity < input.quantity || !toWarehouse) {
          observer.error(new Error("Insufficient stock in source warehouse."));
          return;
        }

        fromBalance.quantity -= input.quantity;
        const targetBalance = product.balances.find((item) => item.warehouseId === input.toWarehouseId);
        if (targetBalance) {
          targetBalance.quantity += input.quantity;
        } else {
          product.balances.push({ warehouseId: toWarehouse.id, warehouseCode: toWarehouse.code, warehouseName: toWarehouse.name, quantity: input.quantity });
        }
        refreshProductState(product.id);
        const transfer: StockTransfer = { id: `T-${Date.now()}`, reference: `TR-${Date.now()}`, productId: input.productId, fromWarehouseId: input.fromWarehouseId, toWarehouseId: input.toWarehouseId, quantity: input.quantity, status: "COMPLETED", createdAt: new Date().toISOString() };
        transfersDb = [transfer, ...transfersDb];
        movementDb = [
          { id: `M-${Date.now()}-1`, productId: input.productId, warehouseId: input.fromWarehouseId, type: "TRANSFER_OUT", quantity: input.quantity, reason: input.reason, createdAt: new Date().toISOString() },
          { id: `M-${Date.now()}-2`, productId: input.productId, warehouseId: input.toWarehouseId, type: "TRANSFER_IN", quantity: input.quantity, reason: input.reason, createdAt: new Date().toISOString() },
          ...movementDb
        ];
        auditDb = [{ id: `A-${Date.now()}`, action: "STOCK_TRANSFERRED", entityType: "TRANSFER", entityId: transfer.id, createdAt: new Date().toISOString() }, ...auditDb];
        refreshWarehouseState();
        observer.next({ data: { transferStock: transfer } });
        observer.complete();
        return;
      }

      if (operationName === "CreatePurchaseOrder") {
        const input = variables?.input as { supplier: string; warehouseId: string; lines: Array<{ productId: string; quantityOrdered: number; unitPrice: number }> };
        const order: PurchaseOrder = {
          id: `PO-${Date.now()}`,
          reference: `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
          supplier: input.supplier,
          status: "APPROVED",
          warehouseId: input.warehouseId,
          createdAt: new Date().toISOString(),
          lines: input.lines.map((line, index) => ({ id: `POL-${Date.now()}-${index}`, productId: line.productId, quantityOrdered: line.quantityOrdered, quantityReceived: 0, unitPrice: line.unitPrice }))
        };
        purchaseOrdersDb = [order, ...purchaseOrdersDb];
        auditDb = [{ id: `A-${Date.now()}`, action: "PURCHASE_ORDER_CREATED", entityType: "PURCHASE_ORDER", entityId: order.id, createdAt: new Date().toISOString() }, ...auditDb];
        observer.next({ data: { createPurchaseOrder: order } });
        observer.complete();
        return;
      }

      if (operationName === "ReceivePurchaseOrder") {
        const input = variables?.input as { purchaseOrderId: string; lines: Array<{ productId: string; quantity: number }>; notes?: string };
        const order = purchaseOrdersDb.find((item) => item.id === input.purchaseOrderId);
        if (!order) {
          observer.error(new Error("Purchase order not found."));
          return;
        }

        const receipt: GoodsReceipt = {
          id: `GR-${Date.now()}`,
          reference: `GRN-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
          purchaseOrderId: order.id,
          warehouseId: order.warehouseId,
          notes: input.notes,
          createdAt: new Date().toISOString(),
          lines: input.lines.map((line, index) => ({ id: `GRL-${Date.now()}-${index}`, productId: line.productId, quantity: line.quantity }))
        };

        receiptsDb = [receipt, ...receiptsDb];
        order.lines = order.lines.map((line) => {
          const received = input.lines.find((item) => item.productId === line.productId)?.quantity ?? 0;
          return { ...line, quantityReceived: line.quantityReceived + received };
        });
        order.status = order.lines.every((line) => line.quantityReceived >= line.quantityOrdered) ? "RECEIVED" : "PARTIALLY_RECEIVED";

        for (const line of input.lines) {
          const product = productsDb.find((item) => item.id === line.productId);
          if (!product) continue;
          const warehouse = warehousesDb.find((item) => item.id === order.warehouseId) ?? warehousesDb[0];
          const balance = product.balances.find((item) => item.warehouseId === order.warehouseId);
          if (balance) {
            balance.quantity += line.quantity;
          } else {
            product.balances.push({ warehouseId: warehouse.id, warehouseCode: warehouse.code, warehouseName: warehouse.name, quantity: line.quantity });
          }
          refreshProductState(product.id);
          movementDb = [{ id: `M-${Date.now()}-${line.productId}`, productId: line.productId, warehouseId: order.warehouseId, type: "RECEIPT", quantity: line.quantity, reason: "Goods receipt", createdAt: new Date().toISOString() }, ...movementDb];
        }
        refreshWarehouseState();
        observer.next({ data: { receivePurchaseOrder: receipt } });
        observer.complete();
        return;
      }

      if (operationName === "SaveAlertRule") {
        const input = variables?.input as AlertRule;
        const rule: AlertRule = { ...input, id: input.id ?? `rule-${Date.now()}`, createdAt: new Date().toISOString() };
        const existingIndex = alertRulesDb.findIndex((item) => item.id === rule.id);
        if (existingIndex >= 0) {
          alertRulesDb[existingIndex] = rule;
        } else {
          alertRulesDb = [rule, ...alertRulesDb];
        }
        observer.next({ data: { saveAlertRule: rule } });
        observer.complete();
        return;
      }

      observer.error(new Error(`Unknown operation: ${operationName}`));
    };

    run().catch((error) => observer.error(error));
  });
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((entry) => {
      const isUnauthorized = /unauthorized/i.test(entry.message);

      if (isUnauthorized && typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STORAGE_KEY);

        if (window.location.pathname !== "/") {
          window.location.replace("/");
        }

        return;
      }

      reportError(new Error(entry.message), "graphql", {
        operation: operation.operationName
      });
    });
  }

  if (networkError) {
    reportError(networkError, "network", {
      operation: operation.operationName
    });
  }
});

const backendGraphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;

const backendLink = backendGraphqlUrl
  ? ApolloLink.from([
      setContext((_, { headers }) => {
        const raw = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
        const token = raw ? (JSON.parse(raw) as { token?: string }).token : null;

        return {
          headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        };
      }),
      createHttpLink({ uri: backendGraphqlUrl, credentials: "include" })
    ])
  : null;

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, backendLink ?? mockLink]),
  cache: new InMemoryCache()
});

