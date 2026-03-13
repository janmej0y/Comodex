import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertProductInput } from "./dto/upsert-product.input";
import { AdjustStockInput } from "./dto/adjust-stock.input";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  products() {
    return this.prisma.product.findMany({
      orderBy: { updatedAt: "desc" }
    });
  }

  product(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async upsertProduct(input: UpsertProductInput) {
    const existing = await this.prisma.product.findUnique({ where: { id: input.id } });

    const next = await this.prisma.product.upsert({
      where: { id: input.id },
      update: {
        name: input.name,
        category: input.category,
        unitPrice: input.unitPrice,
        quantity: input.quantity
      },
      create: {
        id: input.id,
        name: input.name,
        category: input.category,
        unitPrice: input.unitPrice,
        quantity: input.quantity
      }
    });

    if (!existing) {
      await this.prisma.productMovement.create({
        data: {
          productId: input.id,
          quantity: input.quantity,
          type: "IN",
          reason: "Initial stock"
        }
      });
    } else if (existing.quantity !== input.quantity) {
      await this.prisma.productMovement.create({
        data: {
          productId: input.id,
          quantity: Math.abs(input.quantity - existing.quantity),
          type: "ADJUSTMENT",
          reason: "Manual edit"
        }
      });
    }

    return next;
  }

  async adjustStock(input: AdjustStockInput) {
    const existing = await this.prisma.product.findUnique({ where: { id: input.productId } });

    if (!existing) {
      throw new NotFoundException("Product not found.");
    }

    const quantity = Math.max(0, existing.quantity + input.delta);

    const next = await this.prisma.product.update({
      where: { id: input.productId },
      data: { quantity }
    });

    await this.prisma.productMovement.create({
      data: {
        productId: input.productId,
        quantity: Math.abs(input.delta),
        type: "ADJUSTMENT",
        reason: input.reason
      }
    });

    return next;
  }

  productMovements(productId: string) {
    return this.prisma.productMovement.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" }
    });
  }

  async productTrend(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    const base = product?.quantity ?? 0;
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return labels.map((label, index) => ({
      label,
      value: Math.max(0, Math.round(base - 25 + index * 8 + ((index % 2 === 0 ? 1 : -1) * 3)))
    }));
  }

  async statsFromProducts() {
    const products = await this.prisma.product.findMany();
    return products;
  }
}
