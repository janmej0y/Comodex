export interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  updatedAt: string;
}

export interface ProductTrendPoint {
  label: string;
  value: number;
}

export interface ProductMovement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  reason: string;
  createdAt: string;
}