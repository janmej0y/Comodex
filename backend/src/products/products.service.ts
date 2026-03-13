import { Injectable, NotFoundException } from "@nestjs/common";
import { MovementType, Prisma, Product, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AdjustStockInput } from "./dto/adjust-stock.input";
import { TransferStockInput } from "./dto/transfer-stock.input";
import { UpsertProductInput } from "./dto/upsert-product.input";

interface SessionUser {
  id: string;
  role: Role | string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveWarehouseId(warehouseId?: string) {
    if (warehouseId) {
      return warehouseId;
    }

    const warehouse = await this.prisma.warehouse.findFirst({ orderBy: { createdAt: "asc" } });
    if (!warehouse) {
      throw new NotFoundException("No warehouse configured.");
    }

    return warehouse.id;
  }

  private async syncProductQuantity(tx: Prisma.TransactionClient, productId: string) {
    const aggregate = await tx.inventoryBalance.aggregate({
      where: { productId },
      _sum: { quantity: true }
    });

    const quantity = aggregate._sum.quantity ?? 0;

    return tx.product.update({
      where: { id: productId },
      data: { quantity }
    });
  }

  private mapProduct(product: Product & { balances: Array<{ quantity: number; warehouse: { id: string; code: string; name: string } }> }) {
    return {
      ...product,
      lowStock: product.quantity <= product.reorderLevel,
      balances: product.balances.map((balance) => ({
        warehouseId: balance.warehouse.id,
        warehouseCode: balance.warehouse.code,
        warehouseName: balance.warehouse.name,
        quantity: balance.quantity
      }))
    };
  }

  async products() {
    const products = await this.prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        balances: {
          include: { warehouse: true },
          orderBy: { warehouse: { name: "asc" } }
        }
      }
    });

    return products.map((product) => this.mapProduct(product));
  }

  async product(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        balances: {
          include: { warehouse: true },
          orderBy: { warehouse: { name: "asc" } }
        }
      }
    });

    return product ? this.mapProduct(product) : null;
  }

  async warehouses() {
    const warehouses = await this.prisma.warehouse.findMany({
      include: {
        balances: {
          include: { product: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return warehouses.map((warehouse) => ({
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      city: warehouse.city,
      totalUnits: warehouse.balances.reduce((sum, balance) => sum + balance.quantity, 0),
      lowStockSkus: warehouse.balances.filter((balance) => balance.quantity <= balance.product.reorderLevel).length
    }));
  }

  async stockTransfers() {
    return this.prisma.stockTransfer.findMany({ orderBy: { createdAt: "desc" }, take: 12 });
  }

  async upsertProduct(input: UpsertProductInput, actor?: SessionUser) {
    const warehouseId = await this.resolveWarehouseId(input.warehouseId);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id: input.id } });

      const next = await tx.product.upsert({
        where: { id: input.id },
        update: {
          name: input.name,
          category: input.category,
          imageUrl: input.imageUrl,
          unitPrice: input.unitPrice,
          reorderLevel: input.reorderLevel
        },
        create: {
          id: input.id,
          name: input.name,
          category: input.category,
          imageUrl: input.imageUrl,
          unitPrice: input.unitPrice,
          reorderLevel: input.reorderLevel,
          quantity: 0
        }
      });

      if (!existing && input.quantity > 0) {
        await tx.inventoryBalance.upsert({
          where: { warehouseId_productId: { warehouseId, productId: input.id } },
          update: { quantity: { increment: input.quantity } },
          create: { warehouseId, productId: input.id, quantity: input.quantity }
        });

        const balance = await tx.inventoryBalance.findUniqueOrThrow({
          where: { warehouseId_productId: { warehouseId, productId: input.id } }
        });

        await tx.stockLedger.create({
          data: {
            productId: input.id,
            warehouseId,
            movementType: MovementType.IN,
            quantityDelta: input.quantity,
            quantityAfter: balance.quantity,
            reason: "Initial stock",
            referenceType: "PRODUCT_UPSERT",
            referenceId: input.id,
            createdById: actor?.id
          }
        });
      }

      if (existing && existing.quantity !== input.quantity) {
        const currentBalance = await tx.inventoryBalance.findUnique({
          where: { warehouseId_productId: { warehouseId, productId: input.id } }
        });

        const currentQty = currentBalance?.quantity ?? 0;
        const delta = input.quantity - currentQty;

        await tx.inventoryBalance.upsert({
          where: { warehouseId_productId: { warehouseId, productId: input.id } },
          update: { quantity: Math.max(0, input.quantity) },
          create: { warehouseId, productId: input.id, quantity: Math.max(0, input.quantity) }
        });

        await tx.stockLedger.create({
          data: {
            productId: input.id,
            warehouseId,
            movementType: MovementType.ADJUSTMENT,
            quantityDelta: delta,
            quantityAfter: Math.max(0, input.quantity),
            reason: "Manual edit",
            referenceType: "PRODUCT_UPSERT",
            referenceId: input.id,
            createdById: actor?.id
          }
        });
      }

      const updated = await this.syncProductQuantity(tx, input.id);

      await tx.auditEvent.create({
        data: {
          action: existing ? "PRODUCT_UPDATED" : "PRODUCT_CREATED",
          entityType: "PRODUCT",
          entityId: input.id,
          metadata: { warehouseId, quantity: updated.quantity },
          actorId: actor?.id
        }
      });

      const hydrated = await tx.product.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          balances: {
            include: { warehouse: true },
            orderBy: { warehouse: { name: "asc" } }
          }
        }
      });

      return this.mapProduct(hydrated);
    });
  }

  async adjustStock(input: AdjustStockInput, actor?: SessionUser) {
    const warehouseId = await this.resolveWarehouseId(input.warehouseId);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id: input.productId } });
      if (!existing) {
        throw new NotFoundException("Product not found.");
      }

      const balance = await tx.inventoryBalance.upsert({
        where: { warehouseId_productId: { warehouseId, productId: input.productId } },
        update: {},
        create: { warehouseId, productId: input.productId, quantity: 0 }
      });

      const nextBalance = Math.max(0, balance.quantity + input.delta);
      await tx.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId, productId: input.productId } },
        data: { quantity: nextBalance }
      });

      await tx.stockLedger.create({
        data: {
          productId: input.productId,
          warehouseId,
          movementType: MovementType.ADJUSTMENT,
          quantityDelta: input.delta,
          quantityAfter: nextBalance,
          reason: input.reason,
          referenceType: "STOCK_ADJUSTMENT",
          createdById: actor?.id
        }
      });

      const updated = await this.syncProductQuantity(tx, input.productId);

      await tx.auditEvent.create({
        data: {
          action: "STOCK_ADJUSTED",
          entityType: "PRODUCT",
          entityId: input.productId,
          metadata: { warehouseId, delta: input.delta, reason: input.reason, quantity: updated.quantity },
          actorId: actor?.id
        }
      });

      const hydrated = await tx.product.findUniqueOrThrow({
        where: { id: input.productId },
        include: {
          balances: {
            include: { warehouse: true },
            orderBy: { warehouse: { name: "asc" } }
          }
        }
      });

      return this.mapProduct(hydrated);
    });
  }

  async transferStock(input: TransferStockInput, actor?: SessionUser) {
    if (input.fromWarehouseId === input.toWarehouseId) {
      throw new NotFoundException("Source and destination warehouses must differ.");
    }

    return this.prisma.$transaction(async (tx) => {
      const source = await tx.inventoryBalance.findUnique({
        where: { warehouseId_productId: { warehouseId: input.fromWarehouseId, productId: input.productId } }
      });

      if (!source || source.quantity < input.quantity) {
        throw new NotFoundException("Insufficient stock in source warehouse.");
      }

      const nextSource = source.quantity - input.quantity;
      await tx.inventoryBalance.update({
        where: { warehouseId_productId: { warehouseId: input.fromWarehouseId, productId: input.productId } },
        data: { quantity: nextSource }
      });

      const destination = await tx.inventoryBalance.upsert({
        where: { warehouseId_productId: { warehouseId: input.toWarehouseId, productId: input.productId } },
        update: { quantity: { increment: input.quantity } },
        create: { warehouseId: input.toWarehouseId, productId: input.productId, quantity: input.quantity }
      });

      const transfer = await tx.stockTransfer.create({
        data: {
          reference: `TR-${Date.now()}`,
          productId: input.productId,
          fromWarehouseId: input.fromWarehouseId,
          toWarehouseId: input.toWarehouseId,
          quantity: input.quantity
        }
      });

      await tx.stockLedger.createMany({
        data: [
          {
            productId: input.productId,
            warehouseId: input.fromWarehouseId,
            movementType: MovementType.TRANSFER_OUT,
            quantityDelta: -input.quantity,
            quantityAfter: nextSource,
            reason: input.reason,
            referenceType: "TRANSFER",
            referenceId: transfer.id,
            createdById: actor?.id
          },
          {
            productId: input.productId,
            warehouseId: input.toWarehouseId,
            movementType: MovementType.TRANSFER_IN,
            quantityDelta: input.quantity,
            quantityAfter: destination.quantity,
            reason: input.reason,
            referenceType: "TRANSFER",
            referenceId: transfer.id,
            createdById: actor?.id
          }
        ]
      });

      await tx.auditEvent.create({
        data: {
          action: "STOCK_TRANSFERRED",
          entityType: "TRANSFER",
          entityId: transfer.id,
          metadata: {
            productId: input.productId,
            fromWarehouseId: input.fromWarehouseId,
            toWarehouseId: input.toWarehouseId,
            quantity: input.quantity,
            reason: input.reason
          },
          actorId: actor?.id
        }
      });

      return transfer;
    });
  }

  async productMovements(productId: string) {
    const entries = await this.prisma.stockLedger.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return entries.map((entry) => ({
      id: entry.id,
      productId: entry.productId,
      warehouseId: entry.warehouseId ?? undefined,
      type: entry.movementType,
      quantity: Math.abs(entry.quantityDelta),
      reason: entry.reason,
      createdAt: entry.createdAt
    }));
  }

  async productTrend(productId: string) {
    const entries = await this.prisma.stockLedger.findMany({
      where: { productId },
      orderBy: { createdAt: "asc" },
      take: 14
    });

    if (entries.length === 0) {
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      const base = product?.quantity ?? 0;
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => ({
        label,
        value: Math.max(0, base - 12 + index * 4)
      }));
    }

    return entries.slice(-7).map((entry) => ({
      label: entry.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: entry.quantityAfter
    }));
  }

  statsFromProducts() {
    return this.prisma.product.findMany({ include: { balances: true } });
  }
}

