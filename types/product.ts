export interface WarehouseBalance {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
  lowStock: boolean;
  updatedAt: string;
  balances: WarehouseBalance[];
}

export interface ProductTrendPoint {
  label: string;
  value: number;
}

export interface ProductMovement {
  id: string;
  productId: string;
  warehouseId?: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT" | "RECEIPT";
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface WarehouseInsight {
  id: string;
  code: string;
  name: string;
  city: string;
  totalUnits: number;
  lowStockSkus: number;
}

export interface StockTransfer {
  id: string;
  reference: string;
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
}

export interface PurchaseOrderLine {
  id: string;
  productId: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  reference: string;
  supplier: string;
  status: "DRAFT" | "APPROVED" | "PARTIALLY_RECEIVED" | "RECEIVED";
  warehouseId: string;
  createdAt: string;
  lines: PurchaseOrderLine[];
}

export interface GoodsReceiptLine {
  id: string;
  productId: string;
  quantity: number;
}

export interface GoodsReceipt {
  id: string;
  reference: string;
  purchaseOrderId: string;
  warehouseId: string;
  notes?: string;
  createdAt: string;
  lines: GoodsReceiptLine[];
}

export interface AlertRule {
  id: string;
  name: string;
  threshold: number;
  channel: string;
  isActive: boolean;
  warehouseId?: string;
  productId?: string;
  createdAt: string;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  threshold: number;
  severity: string;
}

export interface AuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  metadata?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStock: number;
  marketValue: number;
  lowInventory: number;
  warehouseCount: number;
  pendingPurchaseOrders: number;
  alertsTriggered: number;
  warehouseInsights: Array<{
    warehouseId: string;
    warehouseName: string;
    totalUnits: number;
    lowStockSkus: number;
  }>;
  receiptsTrend: ProductTrendPoint[];
}

