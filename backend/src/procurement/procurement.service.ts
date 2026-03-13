import { Injectable, NotFoundException } from "@nestjs/common";
import { MovementType, PurchaseOrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePurchaseOrderInput } from "./dto/create-purchase-order.input";
import { ReceivePurchaseOrderInput } from "./dto/receive-purchase-order.input";

@Injectable()
export class ProcurementService {
  constructor(private readonly prisma: PrismaService) {}

  purchaseOrders() {
    return this.prisma.purchaseOrder.findMany({
      include: { lines: true },
      orderBy: { createdAt: "desc" }
    });
  }

  goodsReceipts() {
    return this.prisma.goodsReceipt.findMany({
      include: { lines: true },
      orderBy: { createdAt: "desc" },
      take: 12
    });
  }

  async createPurchaseOrder(input: CreatePurchaseOrderInput, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: {
          reference: `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
          supplier: input.supplier,
          warehouseId: input.warehouseId,
          orderedById: actorId,
          status: PurchaseOrderStatus.APPROVED,
          lines: {
            create: input.lines
          }
        },
        include: { lines: true }
      });

      await tx.auditEvent.create({
        data: {
          action: "PURCHASE_ORDER_CREATED",
          entityType: "PURCHASE_ORDER",
          entityId: order.id,
          metadata: { supplier: input.supplier, lineCount: input.lines.length },
          actorId
        }
      });

      return order;
    });
  }

  async receivePurchaseOrder(input: ReceivePurchaseOrderInput, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id: input.purchaseOrderId },
        include: { lines: true }
      });

      if (!order) {
        throw new NotFoundException("Purchase order not found.");
      }

      const receipt = await tx.goodsReceipt.create({
        data: {
          reference: `GRN-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
          purchaseOrderId: order.id,
          warehouseId: order.warehouseId,
          receivedById: actorId,
          notes: input.notes,
          lines: {
            create: input.lines
          }
        },
        include: { lines: true }
      });

      for (const line of input.lines) {
        const currentBalance = await tx.inventoryBalance.upsert({
          where: { warehouseId_productId: { warehouseId: order.warehouseId, productId: line.productId } },
          update: { quantity: { increment: line.quantity } },
          create: { warehouseId: order.warehouseId, productId: line.productId, quantity: line.quantity }
        });

        await tx.purchaseOrderLine.updateMany({
          where: { purchaseOrderId: order.id, productId: line.productId },
          data: { quantityReceived: { increment: line.quantity } }
        });

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            warehouseId: order.warehouseId,
            movementType: MovementType.RECEIPT,
            quantityDelta: line.quantity,
            quantityAfter: currentBalance.quantity,
            reason: "Goods receipt",
            referenceType: "GOODS_RECEIPT",
            referenceId: receipt.id,
            createdById: actorId
          }
        });

        const aggregate = await tx.inventoryBalance.aggregate({
          where: { productId: line.productId },
          _sum: { quantity: true }
        });

        await tx.product.update({
          where: { id: line.productId },
          data: { quantity: aggregate._sum.quantity ?? 0 }
        });
      }

      const refreshedLines = await tx.purchaseOrderLine.findMany({ where: { purchaseOrderId: order.id } });
      const status = refreshedLines.every((line) => line.quantityReceived >= line.quantityOrdered)
        ? PurchaseOrderStatus.RECEIVED
        : PurchaseOrderStatus.PARTIALLY_RECEIVED;

      await tx.purchaseOrder.update({ where: { id: order.id }, data: { status } });

      await tx.auditEvent.create({
        data: {
          action: "GOODS_RECEIPT_POSTED",
          entityType: "GOODS_RECEIPT",
          entityId: receipt.id,
          metadata: { purchaseOrderId: order.id, lineCount: input.lines.length },
          actorId
        }
      });

      return receipt;
    });
  }
}

