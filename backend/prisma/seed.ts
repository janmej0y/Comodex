import { PrismaClient, PurchaseOrderStatus, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const [manager, storeKeeper] = await Promise.all([
    prisma.user.upsert({
      where: { email: "manager@comodex.io" },
      update: { name: "Operations Manager", passwordHash, role: Role.MANAGER },
      create: {
        email: "manager@comodex.io",
        name: "Operations Manager",
        passwordHash,
        role: Role.MANAGER
      }
    }),
    prisma.user.upsert({
      where: { email: "storekeeper@comodex.io" },
      update: { name: "Store Keeper", passwordHash, role: Role.STORE_KEEPER },
      create: {
        email: "storekeeper@comodex.io",
        name: "Store Keeper",
        passwordHash,
        role: Role.STORE_KEEPER
      }
    })
  ]);

  const warehouses = await Promise.all([
    prisma.warehouse.upsert({
      where: { code: "MUM-CEN" },
      update: { name: "Mumbai Central", city: "Mumbai" },
      create: { code: "MUM-CEN", name: "Mumbai Central", city: "Mumbai" }
    }),
    prisma.warehouse.upsert({
      where: { code: "DEL-NOR" },
      update: { name: "Delhi North", city: "Delhi" },
      create: { code: "DEL-NOR", name: "Delhi North", city: "Delhi" }
    }),
    prisma.warehouse.upsert({
      where: { code: "BLR-HUB" },
      update: { name: "Bangalore Hub", city: "Bangalore" },
      create: { code: "BLR-HUB", name: "Bangalore Hub", city: "Bangalore" }
    })
  ]);

  const products = [
    { id: "P-101", name: "Arabica Coffee Beans", category: "Beverage", unitPrice: 1249.99, reorderLevel: 60 },
    { id: "P-102", name: "Premium Wheat Flour", category: "Grains", unitPrice: 425.75, reorderLevel: 50 },
    { id: "P-103", name: "Himalayan Rock Salt", category: "Spices", unitPrice: 310.2, reorderLevel: 40 },
    { id: "P-104", name: "Cold-Pressed Olive Oil", category: "Cooking", unitPrice: 895.5, reorderLevel: 45 }
  ];

  for (const item of products) {
    await prisma.product.upsert({
      where: { id: item.id },
      update: { name: item.name, category: item.category, unitPrice: item.unitPrice, reorderLevel: item.reorderLevel },
      create: { ...item, quantity: 0 }
    });
  }

  const seededBalances = [
    { warehouseCode: "MUM-CEN", productId: "P-101", quantity: 120 },
    { warehouseCode: "DEL-NOR", productId: "P-101", quantity: 80 },
    { warehouseCode: "BLR-HUB", productId: "P-101", quantity: 50 },
    { warehouseCode: "MUM-CEN", productId: "P-102", quantity: 28 },
    { warehouseCode: "DEL-NOR", productId: "P-102", quantity: 25 },
    { warehouseCode: "BLR-HUB", productId: "P-102", quantity: 15 },
    { warehouseCode: "MUM-CEN", productId: "P-103", quantity: 12 },
    { warehouseCode: "DEL-NOR", productId: "P-103", quantity: 8 },
    { warehouseCode: "BLR-HUB", productId: "P-103", quantity: 4 },
    { warehouseCode: "MUM-CEN", productId: "P-104", quantity: 65 },
    { warehouseCode: "DEL-NOR", productId: "P-104", quantity: 35 },
    { warehouseCode: "BLR-HUB", productId: "P-104", quantity: 30 }
  ];

  const warehouseByCode = new Map(warehouses.map((warehouse) => [warehouse.code, warehouse]));

  for (const item of seededBalances) {
    const warehouse = warehouseByCode.get(item.warehouseCode);
    if (!warehouse) continue;

    await prisma.inventoryBalance.upsert({
      where: { warehouseId_productId: { warehouseId: warehouse.id, productId: item.productId } },
      update: { quantity: item.quantity },
      create: { warehouseId: warehouse.id, productId: item.productId, quantity: item.quantity }
    });

    await prisma.stockLedger.create({
      data: {
        productId: item.productId,
        warehouseId: warehouse.id,
        movementType: "IN",
        quantityDelta: item.quantity,
        quantityAfter: item.quantity,
        reason: "Seeded opening balance",
        referenceType: "SEED",
        createdById: manager.id
      }
    });
  }

  for (const item of products) {
    const total = seededBalances.filter((balance) => balance.productId === item.id).reduce((sum, balance) => sum + balance.quantity, 0);
    await prisma.product.update({ where: { id: item.id }, data: { quantity: total } });
  }

  const po = await prisma.purchaseOrder.upsert({
    where: { reference: "PO-2026-0001" },
    update: { supplier: "Acme Supplier Pvt Ltd", status: PurchaseOrderStatus.PARTIALLY_RECEIVED, warehouseId: warehouses[0].id, orderedById: manager.id },
    create: {
      reference: "PO-2026-0001",
      supplier: "Acme Supplier Pvt Ltd",
      status: PurchaseOrderStatus.PARTIALLY_RECEIVED,
      warehouseId: warehouses[0].id,
      orderedById: manager.id
    }
  });

  await prisma.purchaseOrderLine.createMany({
    data: [
      { purchaseOrderId: po.id, productId: "P-101", quantityOrdered: 90, quantityReceived: 40, unitPrice: 1180 },
      { purchaseOrderId: po.id, productId: "P-103", quantityOrdered: 50, quantityReceived: 20, unitPrice: 280 }
    ],
    skipDuplicates: true
  });

  await prisma.alertRule.upsert({
    where: { id: "low-stock-global" },
    update: { name: "Default low stock", threshold: 40, channel: "EMAIL", isActive: true },
    create: { id: "low-stock-global", name: "Default low stock", threshold: 40, channel: "EMAIL", isActive: true }
  });

  await prisma.auditEvent.createMany({
    data: [
      { action: "LOGIN_POLICY_CONFIGURED", entityType: "AUTH", entityId: manager.id, metadata: { refreshTokens: true }, actorId: manager.id },
      { action: "INITIAL_STOCK_SEEDED", entityType: "SYSTEM", entityId: "bootstrap", metadata: { warehouses: warehouses.length }, actorId: manager.id }
    ]
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

