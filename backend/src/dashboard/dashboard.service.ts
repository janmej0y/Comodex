import { Injectable } from "@nestjs/common";
import { PurchaseOrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboardStats() {
    const [products, warehouses, purchaseOrders, balances, receipts, alertRules] = await Promise.all([
      this.prisma.product.findMany(),
      this.prisma.warehouse.findMany(),
      this.prisma.purchaseOrder.findMany({ where: { status: { in: [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.PARTIALLY_RECEIVED] } } }),
      this.prisma.inventoryBalance.findMany({ include: { product: true, warehouse: true } }),
      this.prisma.goodsReceipt.findMany({ orderBy: { createdAt: "asc" }, take: 8, include: { lines: true } }),
      this.prisma.alertRule.findMany({ where: { isActive: true } })
    ]);

    const totalStock = products.reduce((sum, item) => sum + item.quantity, 0);
    const marketValue = products.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const lowInventory = products.filter((item) => item.quantity <= item.reorderLevel).length;

    const warehouseInsights = warehouses.map((warehouse) => {
      const scoped = balances.filter((balance) => balance.warehouseId === warehouse.id);
      return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        totalUnits: scoped.reduce((sum, item) => sum + item.quantity, 0),
        lowStockSkus: scoped.filter((item) => item.quantity <= item.product.reorderLevel).length
      };
    });

    const alertsTriggered = balances.filter((balance) => {
      const scopedRule = alertRules.find(
        (rule) => (!rule.productId || rule.productId === balance.productId) && (!rule.warehouseId || rule.warehouseId === balance.warehouseId)
      );
      const threshold = scopedRule?.threshold ?? balance.product.reorderLevel;
      return balance.quantity <= threshold;
    }).length;

    return {
      totalStock,
      marketValue,
      lowInventory,
      warehouseCount: warehouses.length,
      pendingPurchaseOrders: purchaseOrders.length,
      alertsTriggered,
      warehouseInsights,
      receiptsTrend: receipts.map((receipt) => ({
        label: receipt.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: receipt.lines.reduce((sum, line) => sum + line.quantity, 0)
      }))
    };
  }
}

