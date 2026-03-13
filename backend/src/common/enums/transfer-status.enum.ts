import { registerEnumType } from "@nestjs/graphql";

export enum TransferStatusEnum {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED"
}

registerEnumType(TransferStatusEnum, { name: "TransferStatus" });

