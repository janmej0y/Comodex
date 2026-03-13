import { registerEnumType } from "@nestjs/graphql";

export enum MovementTypeEnum {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT"
}

registerEnumType(MovementTypeEnum, { name: "MovementType" });