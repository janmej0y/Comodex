import { registerEnumType } from "@nestjs/graphql";

export enum PurchaseOrderStatusEnum {
  DRAFT = "DRAFT",
  APPROVED = "APPROVED",
  PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED",
  RECEIVED = "RECEIVED"
}

registerEnumType(PurchaseOrderStatusEnum, { name: "PurchaseOrderStatus" });

