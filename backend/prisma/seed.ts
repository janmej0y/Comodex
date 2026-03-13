import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "manager@comodex.io" },
    update: {},
    create: {
      email: "manager@comodex.io",
      name: "Manager",
      passwordHash,
      role: "MANAGER"
    }
  });

  await prisma.user.upsert({
    where: { email: "storekeeper@comodex.io" },
    update: {},
    create: {
      email: "storekeeper@comodex.io",
      name: "Store Keeper",
      passwordHash,
      role: "STORE_KEEPER"
    }
  });

  const products = [
    { id: "P-101", name: "Arabica Coffee Beans", category: "Beverage", unitPrice: 1249.99, quantity: 250 },
    { id: "P-102", name: "Premium Wheat Flour", category: "Grains", unitPrice: 425.75, quantity: 68 },
    { id: "P-103", name: "Himalayan Rock Salt", category: "Spices", unitPrice: 310.2, quantity: 24 },
    { id: "P-104", name: "Cold-Pressed Olive Oil", category: "Cooking", unitPrice: 895.5, quantity: 130 }
  ];

  for (const item of products) {
    await prisma.product.upsert({ where: { id: item.id }, update: item, create: item });
  }

  await prisma.productMovement.createMany({
    data: [
      { productId: "P-101", type: "IN", quantity: 100, reason: "Supplier restock" },
      { productId: "P-101", type: "OUT", quantity: 20, reason: "Branch transfer" },
      { productId: "P-103", type: "ADJUSTMENT", quantity: 4, reason: "Stock correction" }
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
