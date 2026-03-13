import { registerEnumType } from "@nestjs/graphql";

export enum MovementTypeEnum {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
  TRANSFER_IN = "TRANSFER_IN",
  TRANSFER_OUT = "TRANSFER_OUT",
  RECEIPT = "RECEIPT"
}

registerEnumType(MovementTypeEnum, { name: "MovementType" });

