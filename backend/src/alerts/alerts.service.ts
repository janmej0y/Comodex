import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SaveAlertRuleInput } from "./dto/save-alert-rule.input";

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  alertRules() {
    return this.prisma.alertRule.findMany({ orderBy: { createdAt: "desc" } });
  }

  async lowStockAlerts() {
    const balances = await this.prisma.inventoryBalance.findMany({
      include: {
        product: true,
        warehouse: true
      },
      orderBy: { updatedAt: "asc" }
    });

    const rules = await this.prisma.alertRule.findMany({ where: { isActive: true } });
    const defaultThreshold = rules.find((rule) => !rule.productId && !rule.warehouseId)?.threshold ?? 40;

    return balances
      .filter((balance) => {
        const scopedRule = rules.find(
          (rule) => (!rule.productId || rule.productId === balance.productId) && (!rule.warehouseId || rule.warehouseId === balance.warehouseId)
        );
        const threshold = scopedRule?.threshold ?? balance.product.reorderLevel ?? defaultThreshold;
        return balance.quantity <= threshold;
      })
      .map((balance) => {
        const scopedRule = rules.find(
          (rule) => (!rule.productId || rule.productId === balance.productId) && (!rule.warehouseId || rule.warehouseId === balance.warehouseId)
        );
        const threshold = scopedRule?.threshold ?? balance.product.reorderLevel ?? defaultThreshold;

        return {
          productId: balance.productId,
          productName: balance.product.name,
          warehouseId: balance.warehouseId,
          warehouseName: balance.warehouse.name,
          quantity: balance.quantity,
          threshold,
          severity: balance.quantity === 0 ? "critical" : balance.quantity <= Math.ceil(threshold / 2) ? "high" : "medium"
        };
      })
      .sort((a, b) => a.quantity - b.quantity);
  }

  async saveAlertRule(input: SaveAlertRuleInput, actorId: string) {
    const rule = await this.prisma.alertRule.upsert({
      where: { id: input.id ?? `rule-${Date.now()}` },
      update: {
        name: input.name,
        threshold: input.threshold,
        channel: input.channel,
        isActive: input.isActive,
        warehouseId: input.warehouseId,
        productId: input.productId
      },
      create: {
        id: input.id ?? `rule-${Date.now()}`,
        name: input.name,
        threshold: input.threshold,
        channel: input.channel,
        isActive: input.isActive,
        warehouseId: input.warehouseId,
        productId: input.productId
      }
    });

    await this.prisma.auditEvent.create({
      data: {
        action: input.id ? "ALERT_RULE_UPDATED" : "ALERT_RULE_CREATED",
        entityType: "ALERT_RULE",
        entityId: rule.id,
        metadata: { threshold: input.threshold, channel: input.channel },
        actorId
      }
    });

    return rule;
  }
}

